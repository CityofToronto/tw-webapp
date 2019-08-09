import gql from 'graphql-tag';
import { createClient } from '@/apollo/vue-apollo';
import { DeleteQuery, QueryError } from '../types';
import { dispatchError } from './utils';

const apollo = createClient();

export const deleteEntry = ({
  tableName,
  id,
  callBack,
}:DeleteQuery) => {
  apollo.mutate({
    mutation: gql`
    mutation {
      delete_${tableName}(
      where: {
        id: {_eq: ${id}}
      }) {
      affected_rows
    }
  }`,
  })
    .then(() => {
      callBack();
    })
    .catch((error: QueryError) => dispatchError(error));
};

export default deleteEntry;
