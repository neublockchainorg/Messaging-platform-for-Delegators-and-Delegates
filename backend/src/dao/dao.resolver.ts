import { Args, Resolver, Query } from '@nestjs/graphql';
import { DaoService } from './dao.service';
import { DaoQuery } from './dtos/DaoQuery.dto';
import { DaoResponse } from './dtos/DaoResponse.dto';
import { BadRequestException } from '@nestjs/common';

@Resolver()
export class DaoResolver {
  private readonly defaultProtocol = 'uniswap';

  constructor(private readonly daoService: DaoService) {}

  @Query(() => DaoResponse, { name: 'delegatorsForDelegate' })
  async getDelegatorsForDelegate(@Args() daoQuery: DaoQuery): Promise<DaoResponse> {
    const { delegateAddress, protocol, refresh } = daoQuery;

    if (!delegateAddress) {
      throw new BadRequestException('Delegate address is required');
    }

    return this.daoService.getDelegatorsForDelegate(
      delegateAddress.toLowerCase(),
      protocol ? protocol.toLowerCase() : this.defaultProtocol,
      refresh,
    );
  }
}
