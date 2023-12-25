import { Module } from '@nestjs/common';
import { DaoService } from './dao.service';
import { DaoResolver } from './dao.resolver';

@Module({
  providers: [DaoResolver, DaoService],
})
export class DaoModule {}
