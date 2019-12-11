import { WebSocketLink } from 'apollo-link-ws';
import { HttpLink } from 'apollo-link-http';
import { split } from 'apollo-link';

import { SubscriptionClient } from 'subscriptions-transport-ws';
import { setContext } from 'apollo-link-context';
import { storeInstance } from '@/store';
import { getMainDefinition } from 'apollo-utilities';
import { OperationDefinitionNode } from 'graphql';

// TODO Proper authentication
const GRAPH_ENDPOINT_HTTP =
  'https://hasura.tw-webapp-next.duckdns.org/v1/graphql';
const GRAPHQL_ENDPOINT_WS =
  'wss://hasura.tw-webapp-next.duckdns.org/v1/graphql';
const authToken = process.env.VUE_APP_API;

const getHeaders = () => {
  const username = storeInstance?.auth?.userName;
  const project = storeInstance?.project?.project_number ?? 1;
  return {
    'x-hasura-admin-secret': authToken,
    'x-username': username,
    'x-project': project,
  };
};

const httpLink = new HttpLink({
  uri: GRAPH_ENDPOINT_HTTP,
});

// for http link, we authenticate with set context
const authLink = setContext((_, { headers }) => {
  const customHeaders = getHeaders();
  return {
    headers: {
      ...headers,
      ...customHeaders,
    },
  };
});

// For web sockets we authenticate with connection params function
const wsLink = new WebSocketLink(
  new SubscriptionClient(GRAPHQL_ENDPOINT_WS, {
    reconnect: true,
    lazy: false,
    timeout: 2000,
    connectionParams: () => {
      const customHeaders = getHeaders();
      return {
        headers: {
          ...customHeaders,
        },
      };
    },
  }),
);

// this will make http requests for query, mutation and web sockets for subscriptions
export const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(
      query,
    ) as OperationDefinitionNode;
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  authLink.concat(httpLink),
);

export const forceReconnect = () => {
  //@ts-ignore
  wsLink.subscriptionClient.close(false, false);
  //@ts-ignore
  wsLink.subscriptionClient.connect();
};
