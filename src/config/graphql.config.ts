import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

export default class GraphqlConfig {
  static getConfig(): ApolloDriverConfig {
    return {
      driver: ApolloDriver,
      debug: true,
      playground: true,
      installSubscriptionHandlers: true,
      autoSchemaFile: 'schema.gql',
    };
  }
}
