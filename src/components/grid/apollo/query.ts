import gql from 'graphql-tag';
import { Query, QueryError, SortQuery } from './types';
import { constructFilter, constructSimpleFilter, dispatchError } from './utils';
import { createClient } from '@/apollo/vue-apollo';

const apollo = createClient();

export const getColumns = ({ tableName }: Query) => apollo.query({
  query: gql`
    query getColumns {
      __type (
        name: "${tableName}"
      ) {
        fields{
          name
          type {
            kind
            name
            ofType {
              kind
              name
            }
          }
        }
        
      }
    }`,
  // eslint-disable-next-line
  }).then((response: object) => response.data.__type.fields.filter((element: { type: { ofType: { kind: string; }; kind: string; }; }) => (element.type.ofType ? element.type.ofType.kind === 'SCALAR' : element.type.kind === 'SCALAR')))
  .catch((error: string) => dispatchError(error));

export const getRelationships = ({ tableName }: Query) => apollo.query({
  query: gql`
    query getRelationships {
      __type (
        name: "${tableName}"
      ) {
        fields{
          name
          type {
            ofType {
              kind
              name
            }
          }
        }
        
      }
    }`,
  // eslint-disable-next-line
  }).then(response => response.data.__type.fields.filter(element => element.type.ofType ? element.type.ofType.kind === 'LIST' : element.type.kind === 'LIST'))
  .catch((error: QueryError):QueryError => dispatchError(error));

const getTableRows = async ({
  tableName,
  request,
  columns,
}:Query) => {
  const fields = columns.map(col => col.field);
  const sortModel = request.sortModel.map(element => `${element.colId}: ${element.sort},`);
  return apollo.query({
    query: gql`
        query GetRows(
          $startRow: Int,
          $endRow: Int,
        ) {
          ${tableName}(
            offset: $startRow,
            limit: $endRow
            order_by: {${sortModel}}
            where: ${constructFilter(request.filterModel)}
          ) {
            ${fields}
          }
        }
      `,
    variables: {
      startRow: request.startRow,
      endRow: request.endRow,
    },
    fetchPolicy: 'network-only',
  }).then(response => response.data[tableName])
    .catch(error => dispatchError(error));
};


const getOneToManyRows = async ({
  tableName,
  dependsOn,
  id,
}: Query) => {
  const fields = await getColumns({ tableName });

  return apollo.query({
    query: gql`
            query {
              ${dependsOn} (
                where: {
                  id: {_eq: ${id}}
                }
              ) {
                ${tableName} {
                  ${fields.map(column => column.name)}
                }
              }
            }
          `,
    fetchPolicy: 'network-only',
  }).then(response => response.data[dependsOn][0][tableName]);
};


const getManyToManyRows = async ({
  tableName,
  dependsOn,
  id,
}:Query) => {
  const fields = await getColumns({ tableName });

  return apollo.query({
    query: gql`
            query getData {
              ${dependsOn} (
                where: {
                  id: {_eq: ${id}}
                }
              ) {
                ${dependsOn}_${tableName} {
                  ${tableName} {
                    ${fields.map(column => column.name)}
                  }
                }
              }
            }`,
    fetchPolicy: 'network-only',
  }).then(response => response.data[dependsOn][0][`${dependsOn}_${tableName}`].map(x => x[tableName]))
    .catch(error => dispatchError(error));
};

export const getRows = async ({
  tableName,
  dependsOn,
  id,
  request,
  columns,
  relationshipType,
}:SortQuery) => {
  if (relationshipType === undefined) {
    return getTableRows({
      tableName,
      request,
      columns,
    });
  } if (relationshipType === 'oneToMany') {
    return getOneToManyRows({
      tableName,
      dependsOn,
      id,
    });
  } if (relationshipType === 'manyToMany') {
    return getManyToManyRows({
      tableName,
      dependsOn,
      id,
    });
  }
  throw Error('Can\'t find rows');
};

export const getIdFromData = ({
  tableName,
  filterModel,
}:Query) => apollo.query({
  query: gql`
      query getId {
        ${tableName} (
          where: {
            ${constructSimpleFilter(filterModel)}
          }
        ) {
          id
        }
      }
    `,
}).then(response => response.data[tableName][0].id);

const getOneToManyTableName = async ({ tableName, relationshipName }) => {
  const queryResult = query => this.apollo.query({
    query: gql`
        {
          __type (name: "${tableName}") {
            fields {
              name
              ${query}
            }  
          }
        }
      `,
    // eslint-disable-next-line
  }).then(response => response.data.__type.fields.filter(x => x.name === relationshipName)[0]);

  const recursive = async (callBack) => {
    let i = 0;


    const validation = async (obj) => {
      let table;
      if (obj === undefined) {
        i += 1;
        if (i < 10) {
          const queryString = `type { kind name ${'ofType { kind name '.repeat(i)}${'}'.repeat(i + 1)}`;
          const result = await queryResult(queryString);
          validation(result.type);
        }
      } else if (obj.kind === 'OBJECT') {
        callBack(obj.name);
      } else {
        validation(obj.ofType);
      }
      console.log('runs');
      return table;
    };

    const queryString = `type { kind name ${'ofType { kind name '.repeat(i)}${'}'.repeat(i + 1)}`;
    const result = await queryResult(queryString);
    console.log(await validation(result.type));
  };
  const finalName = () => {

  };

  recursive(finalName);
};
