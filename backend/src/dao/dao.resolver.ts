import { Args, Resolver, Query } from '@nestjs/graphql';
import { DaoService } from './dao.service';
import { DaoQuery } from './dtos/DaoQuery.dto';
import { DaoResponse } from './dtos/DaoResponse.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DaoUser } from 'src/shared/entities/DaoUser.entity';

@Resolver()
export class DaoResolver {
  private readonly defaultProtocol = 'uniswap';

  constructor(private readonly daoService: DaoService) {}

  @Query(() => DaoUser, { name: 'User' })
  async getUserData(@Args('publicAddress') publicAddress: string): Promise<DaoUser> {
    const userData = await this.daoService.fetchUserFromDb(publicAddress.toLowerCase(), true);

    if (!userData) {
      throw new NotFoundException('User not found');
    }

    return userData.user;
  }

  @Query(() => DaoResponse, { name: 'delegatorsForDelegate' })
  async getDelegatorsForDelegate(@Args() daoQuery: DaoQuery): Promise<DaoResponse> {
    const { publicAddress, protocol, refresh } = daoQuery;

    if (!publicAddress) {
      throw new BadRequestException('Delegate address is required');
    }

    return this.daoService.getDelegatorsForDelegate(
      publicAddress.toLowerCase(),
      protocol ? protocol.toLowerCase() : this.defaultProtocol,
      refresh,
    );
  }

  @Query(() => DaoResponse, { name: 'delegatesForDelegator' })
  async getDelegateesForDelegator(@Args() daoQuery: DaoQuery): Promise<DaoResponse> {
    const { publicAddress, protocol, refresh } = daoQuery;

    if (!publicAddress) {
      throw new BadRequestException('Delegator address is required');
    }

    return this.daoService.getDelegatesForDelegator(
      publicAddress.toLowerCase(),
      protocol ? protocol.toLowerCase() : this.defaultProtocol,
      refresh,
    );
  }
}
