import Vue from 'vue';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';


const cache = new InMemoryCache({
  addTypename: false,
});

const httpLink = new HttpLink({
  uri: 'https://tw-datamodel.herokuapp.com/v1/graphql',
});

const wsLink = new WebSocketLink({
  uri: 'wss://tw-datamodel.herokuapp.com/v1/graphql',
  options: {
    reconnect: true,
    connectionParams() {
      return {
        headers: {},
      };
    },
  },
});

const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition'
      && definition.operation === 'subscription';
  },
  wsLink,
  httpLink,
);

export const apolloClient = new ApolloClient({
  link,
  cache,
});

export function createClient() {
  return apolloClient;
}
