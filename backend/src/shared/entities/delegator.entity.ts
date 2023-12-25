import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description: 'Delegator Model. This is when fetching the list of delegators for a delegate.',
})
export class DelegatorItem {
  @Field(() => String, { description: 'The delegator address' })
  publicAddress: string;

  @Field(() => Number, {
    description: 'The delegator token balance. For Uniswap DAO: UNI Tokens balance',
  })
  balance: number;

  @Field(() => String, { description: 'The delegator ens name', nullable: true })
  ensName: string;
}
