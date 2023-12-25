import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello There! I am a DAO Relations API server built with NestJS, GraphQL, and MongoDB.';
  }
}
