import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';

// TODO Proper authentication
const GRAPHQL_ENDPOINT = 'wss://hasura.tw-webapp-next.duckdns.org/v1/graphql';
const authToken = 'eDfGfj041tHBYkX9';

export const link = new WebSocketLink(
  new SubscriptionClient(GRAPHQL_ENDPOINT, {
    reconnect: true,
    timeout: 3000,
    connectionParams: {
      headers: {
        'x-hasura-admin-secret': authToken,
      },
    },
  }),
);
