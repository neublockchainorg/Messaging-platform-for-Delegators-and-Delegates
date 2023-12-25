import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description: 'A DAO Relation Model. This is when fetching the list for Delegate and Delegator.',
})
export class DaoRelation {
  @Field(() => String, { description: 'The delegator address' })
  delegator: string;

  @Field(() => String, { description: 'The delegate address' })
  delegate: string;

  @Field(() => String, { description: 'The protocol name' })
  protocol: string;
}
