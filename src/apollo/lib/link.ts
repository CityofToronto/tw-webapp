import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { storeInstance } from '@/store';

// TODO Proper authentication
const GRAPHQL_ENDPOINT = 'wss://hasura.tw-webapp-next.duckdns.org/v1/graphql';
const authToken = process.env.VUE_APP_API;

const subscriptionClient = new SubscriptionClient(GRAPHQL_ENDPOINT, {
  reconnect: true,
  timeout: 1000,
  lazy: true,
  connectionParams: () => {
    const username = storeInstance.auth.username;
    return {
      headers: {
        'x-hasura-admin-secret': authToken,
        'x-username': username,
      },
    };
  },
});

export const link = new WebSocketLink(subscriptionClient);

export const forceReconnect = () => {
  subscriptionClient.close();
  //@ts-ignore
  subscriptionClient.connect();
};
