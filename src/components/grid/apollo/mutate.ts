import gql from 'graphql-tag';
import store from '@/store';
import { AddQuery, QueryError } from './types';
import { dispatchError, stringify } from './utils';
import { createClient } from '@/apollo/vue-apollo';

const apollo = createClient();
// TODO Could make this D R Y

// Add an entry and trigger callback
const addRow = async ({
  tableName,
  rowData,
}:AddQuery) => {
  // console.log(tidyFormData(rowData));
  apollo.mutate({
    mutation: gql`
      mutation {
        insert_${tableName} (
          objects: {
            ${stringify(rowData)}
          }
        ) {
          affected_rows
        }
      }`,
  });
};

const addOneToMany = ({
  tableName,
  dependsOn,
  id,
  rowData,
}:AddQuery) => apollo.mutate({
  mutation: gql`
      mutation {
        insert_${tableName} (
          objects: {
            ${stringify(rowData)},
            ${dependsOn}_id: ${id}
          }
        ) {
          affected_rows
        }
      }`,
});

const addManyToMany = ({
  tableName,
  dependsOn,
  id,
  relationalId,
}:AddQuery) => {
  apollo.mutate({
    mutation: gql`
        mutate {
          insert_${dependsOn}_${tableName} (
            objects: {
              ${dependsOn}_id: ${id},
              ${tableName}_id: ${relationalId},
            }
          ) {
            affected_rows
          }
        }
      `,
  });
};

export const add = ({
  tableName,
  rowData,
  callBack,
  relationshipType,
}:AddQuery) => {
  const id = store.getters.getRowId;
  const dependsOn = store.getters.getTableName;
  const relationalId = store.getters.getRelationId;

  if (relationshipType === undefined) {
    addRow({
      tableName,
      rowData,
      callBack,
    }).then(() => {
      callBack();
    }).catch((error: QueryError) => {
      dispatchError(error);
    });
  }
  if (relationshipType === 'oneToMany') {
    addOneToMany({
      tableName,
      rowData,
      callBack,
      dependsOn,
      id,
    }).then(() => {
      callBack();
    }).catch(error => {
      dispatchError(error);
    });
  }
  if (relationshipType === 'manyToMany') {
    addManyToMany({
      tableName,
      dependsOn,
      callBack,
      id,
      relationalId,
    });
  }
};

export const update = async ({
  tableName,
  data,
  id,
  callBack,
  unsucessfulCallBack,
}) => {
  await apollo.mutate({
    mutation: gql`
    mutation updateRow {
    update_${tableName} (
      where: {
        id: { _eq: ${id} }
      },
      _set: {
        ${stringify(data)}
      }
    ) {
      returning {
        ${Object.keys(data)}
      }
    }
  }`,
  })
    .then(() => {
      callBack();
    })
    .catch((error:QueryError) => {
      dispatchError(error);
      unsucessfulCallBack();
    });
};
