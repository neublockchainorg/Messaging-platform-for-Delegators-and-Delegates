import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class DaoQuery {
  @Field(() => String, { description: 'The delegate or delegator address' })
  publicAddress: string;
  @Field(() => String, { description: 'The protocol name', nullable: true, defaultValue: 'uniswap' })
  protocol?: string;
  @Field(() => Boolean, {
    description: 'Whether to refresh the data from KarmaHQ',
    nullable: true,
    defaultValue: false,
  })
  refresh?: boolean;
}
