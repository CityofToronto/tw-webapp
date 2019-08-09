import gql from 'graphql-tag';
import { createClient } from '@/apollo/vue-apollo';

const apollo = createClient();


const countTableRows = async ({
  tableName,
}) => apollo.query({
  query: gql`
      query countRows {
        ${tableName}_aggregate {
          aggregate {
            count
          }
        }
      }
    `,
  fetchPolicy: 'network-only',
}).then(response => response.data[`${tableName}_aggregate`].aggregate.count)
  .catch(error => dispatchError(error));

const countOneToManyRows = async ({
  tableName, dependsOn, id,
}) => apollo.query({
  query: gql`
      query {
        ${dependsOn}_aggregate (
          where: {
            id: {_eq: ${id}}
          }
        ) {
          nodes {
            ${tableName}_aggregate {
              aggregate {
                count
              }
            }
          }
        }
      }`,
  fetchPolicy: 'network-only',
}).then(response => response.data[`${dependsOn}_aggregate`].nodes[0][`${tableName}_aggregate`].aggregate.count)
  .catch(error => dispatchError(error));

const countManyToManyRows = async ({ tableName, dependsOn, id }) => apollo.query({
  query: gql`
      query countRows {
        ${dependsOn}_${tableName}_aggregate(
          where: {
            ${dependsOn}_id: {_eq: "${id}"}
          }
        ) {
          aggregate {
            count
          }
        }
      }
    `,
  fetchPolicy: 'network-only',
}).then(response => response.data[`${dependsOn}_${tableName}_aggregate`].aggregate.count)
  .catch(error => dispatchError(error));

// eslint-disable-next-line
export const countRows = async ({
  tableName, dependsOn, id, relationshipType,
}):Promise<number> => {
  if (relationshipType === undefined) {
    return countTableRows({
      tableName,
    });
  } if (relationshipType === 'oneToMany') {
    return countOneToManyRows({
      tableName,
      dependsOn,
      id,
    });
  } if (relationshipType === 'manyToMany') {
    return countManyToManyRows({
      tableName,
      dependsOn,
      id,
    });
  }
  throw Error('Can\'t count rows');
};
