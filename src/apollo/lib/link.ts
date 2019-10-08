import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';

import { split, ApolloLink } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

// TODO Proper authenication
const uri = 'https://hasura.tw-webapp-next.duckdns.org/v1/graphql';
const authToken = process.env.HASURA_SECRET || 'eDfGfj041tHBYkX9';

export const link = new HttpLink({
  uri,
});

export const authLink = setContext((_, { headers }) => {
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      //authorization: authToken,
      'x-hasura-admin-secret': authToken,
      //authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// const wsLink = new WebSocketLink({
//   uri: 'wss://tw-backend.duckdns.org:8080/v1/graphql',
//   options: {
//     reconnect: true,
//   },
// });

// export const link = split(
//   // split based on operation type
//   ({ query }): boolean => {
//     const definition = getMainDefinition(query);
//     return (
//       definition.kind === 'OperationDefinition' &&
//       definition.operation === 'subscription'
//     );
//   },
//   // wsLink,
//   httpLink,
// );
