import { Field, ObjectType } from '@nestjs/graphql';
import { DaoRelation } from 'src/shared/entities/DaoRelation.entity';
import { DaoUser } from 'src/shared/entities/DaoUser.entity';

@ObjectType({
  description: 'A DAO Query Response Model. Gives the user and list of relations.',
})
export class DaoResponse {
  @Field(() => DaoUser, { description: 'The user' })
  user: DaoUser;
  @Field(() => [DaoRelation], { description: 'The list of relations', nullable: true })
  daoRelations: DaoRelation[];
}
