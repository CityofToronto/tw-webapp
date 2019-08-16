import { HttpLink } from 'apollo-link-http';

import { split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

const httpLink = new HttpLink({
  uri: 'https://tw-datamodel.herokuapp.com/v1/graphql',
});

const wsLink = new WebSocketLink({
  uri: 'wss://tw-datamodel.herokuapp.com/v1/graphql',
  options: {
    reconnect: true,
  },
});

export const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition'
      && definition.operation === 'subscription';
  },
  wsLink,
  httpLink,
);
