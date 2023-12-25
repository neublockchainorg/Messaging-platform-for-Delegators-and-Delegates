import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description: 'A DAO User Model.',
})
export class DaoUser {
  @Field(() => String, { description: 'The crypto address of the user.' })
  publicAddress: string;

  @Field(() => String, { description: 'The ens name of the user.', nullable: true })
  ensName: string | null;

  @Field(() => Boolean, { description: 'Whether the user is a delegator.' })
  delegator: boolean;

  @Field(() => Boolean, { description: 'Whether the user is a delegate.' })
  delegate: boolean;

  @Field(() => Number, { description: 'The unix timestamp of when the user was created.' })
  createdAt: number;
}
