import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';

import { split, ApolloLink } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

// TODO Proper authentication
const uri = 'http://hasura.tw-webapp.duckdns.org/v1/graphql';
const authToken = process.env.HASURA_SECRET || 'eDfGfj041tHBYkX9';

export const httpLink = new HttpLink({
  uri,
});

export const authLink = setContext((_, { headers }) => {
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      'x-hasura-admin-secret': authToken,
    },
  };
});

const wsLink = new WebSocketLink({
  uri: 'wss://hasura.tw-webapp.duckdns.org/v1/graphql',
  options: {
    reconnect: true,
  },
});

export const link = split(
  // split based on operation type
  ({ query }): boolean => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);
