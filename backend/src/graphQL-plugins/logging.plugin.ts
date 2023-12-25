import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';

/**
 * @notice NOT WORKING!!! This is a plugin to log the request and response of the GraphQL query.
 * @notice Using Interceptors. See src/interceptor/logger.interceptor.ts
 */

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    console.log(
      'Request started! Query:\n',
      // + requestContext.request.query
    );

    return {
      async willSendResponse() {
        console.log(
          'Will send response! Response:\n',
          // + JSON.stringify(requestContext.response)
        );
      },
    };
  }
}
