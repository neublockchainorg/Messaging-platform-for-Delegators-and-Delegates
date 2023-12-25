import { Args, Resolver, Query } from '@nestjs/graphql';
import { DaoService } from './dao.service';
import { DaoQuery } from './dtos/DaoQuery.dto';
import { DaoResponse } from './dtos/DaoResponse.dto';
import { BadRequestException } from '@nestjs/common';
import { DaoUser } from 'src/shared/entities/DaoUser.entity';

@Resolver()
export class DaoResolver {
  private readonly defaultProtocol = 'uniswap';

  constructor(private readonly daoService: DaoService) {}

  @Query(() => DaoUser, { name: 'User' })
  async getUserData(@Args('publicAddress') publicAddress: string): Promise<DaoUser> {
    return (await this.daoService.fetchUserFromDb(publicAddress.toLowerCase())).user;
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

    return this.daoService.getDelegateesForDelegator(
      publicAddress.toLowerCase(),
      protocol ? protocol.toLowerCase() : this.defaultProtocol,
      refresh,
    );
  }
}
