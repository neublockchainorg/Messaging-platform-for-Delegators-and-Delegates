import { Injectable } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import axios from 'axios';

import { getDb } from 'src/config/dbconnection';
import { DelegatorItem } from 'src/shared/entities/delegator.entity';
import { DaoRelation } from 'src/shared/entities/DaoRelation.entity';
import { DaoUser } from 'src/shared/entities/DaoUser.entity';
import { DaoResponse } from './dtos/DaoResponse.dto';

@Injectable()
export class DaoService {
  private readonly db: Db;

  private readonly defaultPageSize = 14500;

  constructor() {
    this.db = getDb();
  }

  getIndexForDaoRelation(delegator: string, delegate: string): string {
    return `${delegator.toLowerCase()}_${delegate.toLowerCase()}`;
  }

  async fetchDelegatorsForDelegateFromKarmaHq(
    delegateAddress: string,
    protocol: string,
    pageSize: number = this.defaultPageSize,
    offset: number = 0,
  ): Promise<DaoRelation[]> {
    console.log(`pageSize: ${pageSize}, offset: ${offset}`);

    const urlString = `https://api.karmahq.xyz/api/dao/${protocol}/delegators/${delegateAddress}?pageSize=${pageSize}&offset=${offset}`;

    console.log(`urlString: ${urlString}`);

    if (pageSize === 0) {
      return [];
    }

    const response = await axios.get(urlString);

    const respData = response.data;

    if (!respData.data) {
      return [];
    }

    const data = respData.data as {
      delegatorsBalance: DelegatorItem[];
      delegatorCount: number;
      totalDelegatedVotes: number;
    };

    let delegators = data.delegatorsBalance.map((delegator) => {
      return {
        index: this.getIndexForDaoRelation(delegator.publicAddress, delegateAddress),
        delegator: delegator.publicAddress.toLowerCase(),
        delegate: delegateAddress,
        protocol: protocol,
      };
    });

    const delegatorCount = data.delegatorCount;

    if (delegatorCount > pageSize * (offset + 1)) {
      const nextDelegators = await this.fetchDelegatorsForDelegateFromKarmaHq(
        delegateAddress,
        protocol,
        pageSize,
        offset + 1,
      );

      console.log(`nextDelegators: ${nextDelegators.length}`);

      delegators = delegators.concat(nextDelegators);
    }

    return delegators;
  }

  async fetchDelegatorsForDelegateFromDb(delegateAddress: string, protocol: string): Promise<DaoRelation[]> {
    const collection = this.db.collection('daorelations');

    const delegators = (await collection
      .find({ delegate: delegateAddress, protocol: protocol })
      .toArray()) as unknown as DaoRelation[];

    return delegators;
  }

  async fetchDelegateesForDelegatorFromKarmaHq(
    delegatorAddress: string,
    protocol: string,
  ): Promise<{ ensName: string | null; daoRelations: DaoRelation[] }> {
    const response = await axios.get(`https://api.karmahq.xyz/api/dao/${protocol}/tokenholders/${delegatorAddress}`);

    const respData = response.data;

    if (!respData.data) {
      return { ensName: null, daoRelations: [] };
    }

    const data = respData.data.tokenholders as {
      ensName: string;
      delegatingHistories: {
        toDelegate: string;
        delegator: string;
        id: string;
      }[];
    }[];

    if (!data || data.length === 0) {
      return { ensName: null, daoRelations: [] };
    }

    const ensName = data[0].ensName;
    const delegatingHistories = data[0].delegatingHistories;

    if (!delegatingHistories || delegatingHistories.length === 0) {
      return { ensName: ensName, daoRelations: [] };
    }

    const daoRelations = delegatingHistories.map((delegatingHistory) => {
      return {
        index: this.getIndexForDaoRelation(delegatorAddress, delegatingHistory.toDelegate),
        delegator: delegatorAddress,
        delegate: delegatingHistory.toDelegate.toLowerCase(),
        protocol: protocol,
      };
    });

    return {
      ensName: ensName,
      daoRelations: daoRelations,
    };
  }

  async insertDataIntoDb(data: DaoRelation[]) {
    if (data.length === 0) {
      return 0;
    }
    const collection = this.db.collection('daorelations');
    const result = await collection.insertMany(data, { ordered: false });
    console.log('Inserted documents =>', result.insertedCount);
    return result.insertedCount;
  }

  async insertUserIntoDb(data: DaoUser) {
    const collection = this.db.collection('daousers');

    const result = await collection.insertOne(data);

    return result;
  }

  async updateUserDataInDb(data: DaoUser) {
    delete data._id;
    return await this.db.collection('daousers').updateOne({ publicAddress: data.publicAddress }, { $set: data });
  }

  async deleteuserFromDb(_id: ObjectId) {
    return await this.db.collection('daousers').deleteOne({ _id: _id });
  }

  async fetchUserFromDb(publicAddress: string, noInsert?: boolean): Promise<{ user: DaoUser; newUser: boolean }> {
    publicAddress = publicAddress.toLowerCase();
    const collection = this.db.collection('daousers');

    const user: DaoUser = (await collection.findOne({ publicAddress: publicAddress })) as unknown as DaoUser;

    if (!user) {
      const newUser = {
        publicAddress: publicAddress,
        ensName: null,
        delegator: false,
        delegate: false,
        createdAt: new Date().getTime(),
      };

      if (!noInsert) {
        await this.insertUserIntoDb(newUser).catch((err) => {
          console.log(err.message);
        });
      }

      return { user: newUser, newUser: true };
    }

    return { user: user, newUser: false };
  }

  async getDelegatorsForDelegate(delegateAddress: string, protocol: string, refresh: boolean): Promise<DaoResponse> {
    const [userData, delegatorsList] = await Promise.all([
      this.fetchUserFromDb(delegateAddress),
      this.fetchDelegatorsForDelegateFromDb(delegateAddress, protocol),
    ]);

    let delegators = delegatorsList;

    if (userData.newUser || refresh) {
      const count = delegators.length;
      const pageSize = count > 0 ? count : this.defaultPageSize;
      const offset = count > 0 ? 1 : 0;

      const delegatorsFromKarmaHq = await this.fetchDelegatorsForDelegateFromKarmaHq(
        delegateAddress,
        protocol,
        pageSize,
        offset,
      );

      await this.insertDataIntoDb(delegatorsFromKarmaHq);

      delegators = delegators.concat(delegatorsFromKarmaHq);
    }

    if (delegators.length > 0 && !userData.user.delegate) {
      userData.user.delegate = true;
      await this.updateUserDataInDb(userData.user);
    } else if (delegators.length === 0 && !userData.user.delegator) {
      await this.deleteuserFromDb(userData.user._id);
    }

    return {
      user: userData.user,
      daoRelations: delegators,
    };
  }

  async getDelegatesForDelegator(delegatorAddress: string, protocol: string, refresh: boolean): Promise<DaoResponse> {
    const [userData, delegatorData] = await Promise.all([
      this.fetchUserFromDb(delegatorAddress),
      this.fetchDelegateesForDelegatorFromKarmaHq(delegatorAddress, protocol),
    ]);

    let delegatees = delegatorData.daoRelations;
    let ensName = delegatorData.ensName;

    if (userData.newUser || refresh) {
      console.log('fetching from karma hq');
      const delegateesFromKarmaHq = await this.fetchDelegateesForDelegatorFromKarmaHq(delegatorAddress, protocol);

      await this.insertDataIntoDb(delegateesFromKarmaHq.daoRelations);

      delegatees = delegateesFromKarmaHq.daoRelations;
      ensName = delegateesFromKarmaHq.ensName;
    }

    let doUpdate = false;

    if (delegatees.length > 0 && !userData.user.delegator) {
      userData.user.delegator = true;
      doUpdate = true;
    }

    if (ensName && userData.user.ensName !== ensName) {
      userData.user.ensName = ensName;
      doUpdate = true;
    }

    if (doUpdate) {
      await this.updateUserDataInDb(userData.user);
    } else if (delegatees.length === 0 && !userData.user.delegate) {
      await this.deleteuserFromDb(userData.user._id);
    }

    return {
      user: {
        ...userData.user,
        ensName: ensName,
      },
      daoRelations: delegatees,
    };
  }
}
