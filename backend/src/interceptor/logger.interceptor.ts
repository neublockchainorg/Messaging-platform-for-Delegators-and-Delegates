import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class GqlLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const resolverName = ctx.getClass().name;
    const info = ctx.getInfo();

    console.log(`Before... ${resolverName} ${info.fieldName}`);

    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`After... ${resolverName} ${info.fieldName} ${Date.now() - now}ms`)));
  }
}
