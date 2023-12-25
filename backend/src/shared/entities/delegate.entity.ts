import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description: 'Delegate Model. This is when fetching the list of delegates for a delegator.',
})
export class DelegatingHistory {
  @Field(() => String, { description: 'The txn hash of the delegation' })
  id: string;

  @Field(() => String, { description: 'The delegate address' })
  toDelegate: string;

  @Field(() => String, { description: 'The delegator address' })
  delegator: string;

  @Field(() => Number, {
    description: 'The amount of tokens delegated',
  })
  timestamp: number;
}
