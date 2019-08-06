import { createClient } from '@/apollo/vue-apollo';
import { DeleteQuery, QueryError } from './types';
import { dispatchError } from './utils';

const apollo = createClient();

export const deleteEntry = ({
  tableName,
  id,
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

    })
    .catch((error: QueryError) => dispatchError(error));
};

export default deleteEntry;
