import { Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
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

  async fetchDelegatorsForDelegateFromKarmaHq(
    delegateAddress: string,
    protocol: string = 'uniswap',
    pageSize: number = this.defaultPageSize,
    offset: number = 0,
  ): Promise<DaoRelation[]> {
    const response = await axios.get(
      `https://api.karmahq.xyz/api/dao/${protocol}/delegators/${delegateAddress}?pageSize=${pageSize}&offset=${offset}}`,
    );

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
        delegator: delegator.publicAddress,
        delegate: delegateAddress,
        protocol: protocol,
      };
    });

    const delegatorCount = data.delegatorCount;

    if (delegatorCount > delegators.length * (offset + 1)) {
      const nextDelegators = await this.fetchDelegatorsForDelegateFromKarmaHq(
        delegateAddress,
        protocol,
        pageSize,
        offset + 1,
      );
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

  async insertDataIntoDb(data: DaoRelation[]) {
    const collection = this.db.collection('daorelations');
    const result = await collection.insertMany(data);
    console.log('Inserted documents =>', result.insertedCount);
    return result.insertedCount;
  }

  async insertUserIntoDb(data: DaoUser) {
    const collection = this.db.collection('daousers');

    const result = await collection.insertOne(data);

    return result;
  }

  async updateUserDataInDb(data: DaoUser) {
    return await this.db.collection('daousers').updateOne({ publicAddress: data.publicAddress }, { $set: data });
  }

  async fetchUserFromDb(publicAddress: string): Promise<{ user: DaoUser; newUser: boolean }> {
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

      await this.insertUserIntoDb(newUser);

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
      let pageSize = this.defaultPageSize;
      let offset = 0;

      if (count > this.defaultPageSize) {
        pageSize = count;
        offset = 1;
      }

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
    }

    return {
      user: userData.user,
      daoRelations: delegators,
    };
  }
}
