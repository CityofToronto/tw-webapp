import ApolloClient from 'apollo-client';
import { NormalizedCacheObject, InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import { link } from './lib/link';
import { dispatchError } from './lib/utils';
import { HasuraField, __TypeKind, TableQueryResult } from '@/types/api';

const isColumn = (element: HasuraField): boolean => {
  const columnType: __TypeKind = element.type.ofType
    ? element.type.ofType.kind
    : element.type.kind;
  return columnType === 'SCALAR' || columnType === 'ENUM';
};

const isRelationship = (element: HasuraField): boolean =>
  element.type.ofType
    ? element.type.ofType.kind !== 'SCALAR'
    : element.type.kind !== 'SCALAR';

class Apollo extends ApolloClient<NormalizedCacheObject> {
  public constructor() {
    super({
      link,
      cache: new InMemoryCache({
        addTypename: false,
      }),
    });
  }

  public getFields(tableName: string): Promise<HasuraField[]> {
    return (
      this.query({
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
      })
        // eslint-disable-next-line
        .then((response: TableQueryResult) => response.data.__type.fields)
        .catch((error): never => dispatchError(error))
    );
  }

  public getColumns(tableName: string): Promise<HasuraField[]> {
    return (
      this.query({
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
                  enumValues {
                    name
                  }
                }
              }
            }
            
          }
        }`,
      })
        // eslint-disable-next-line
        .then((response: TableQueryResult) => response.data.__type.fields.filter((element) => isColumn(element)))
        .catch((error): never => dispatchError(error))
    );
  }

  public getRelationships(tableName: string): Promise<HasuraField[]> {
    return (
      this.query({
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
      })
        // eslint-disable-next-line
        .then((response: TableQueryResult) => response.data.__type.fields.filter((element) => isRelationship(element)))
        .catch((error): never => dispatchError(error))
    );
  }

  public getValuesFromTable<T>({
    tableName,
    columns,
  }: {
    tableName: string;
    columns: string[];
  }): Promise<T> {
    return this.query({
      query: gql`{
          ${tableName} {
            ${columns}
          }
        }`,
    })
      .then((response): T => response.data[tableName])
      .catch((error): never => dispatchError(error));
  }
}

const apolloClient = new Apollo();

export default apolloClient;
