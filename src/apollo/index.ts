import ApolloClient from 'apollo-client';
import { NormalizedCacheObject, InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import { link } from './lib/link';
import { dispatchError } from './lib/utils';
import {
  HasuraField,
  __TypeKind,
  TableQueryResult,
  HasuraTypeResult,
} from '@/types/api';
import { inDebug } from '@/common/utils';

export const isColumn = (element: HasuraField): boolean => {
  const columnType = element.type.ofType
    ? element.type.ofType.kind
    : element.type.kind;
  return ['ENUM', 'SCALAR'].includes(columnType);
};

const isRelationship = (element: HasuraField): boolean =>
  element.type.ofType
    ? element.type.ofType.kind !== 'SCALAR'
    : element.type.kind !== 'SCALAR';

const getError = (error: Error) =>
  inDebug
    ? new Error(
        `Can't fetch table, reload or try again later.
If problem persists, contact support.`,
      )
    : error;

class Apollo extends ApolloClient<NormalizedCacheObject> {
  public constructor() {
    super({
      link,
      cache: new InMemoryCache({
        addTypename: false,
      }),
    });
  }

  public getTypename(tableName: string): Promise<string> {
    return this.query({
      query: gql`
      query getTypename {
        ${tableName} {
          __typename
        }
      }`,
    }).then((response) => response.data[tableName][0].__typename);
  }

  async getFields(typename: string) {
    return this.query<HasuraTypeResult>({
      query: gql`
         query {
          __type(name: "${typename}") {
            fields {
              name
              type {
                kind
                ofType {
                  name
                  kind
                  ofType {
                    kind
                    name
                  }
                }
              }
            }
          }
        }
      `,
    })
      .then(({ data }) => data.__type.fields)
      .catch((error) => {
        throw new Error(`Can't read the fields of ${typename}, ${error}`);
      });
  }

  public async getColumns(tableName: string): Promise<HasuraField[]> {
    return this.query({
      query: gql`
        query getColumns {
          __type (
            name: "${await this.getTypename(tableName)}"
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
      .then((response: TableQueryResult) =>
        response.data.__type.fields.filter((element) => isColumn(element)),
      )
      .catch((error): never => dispatchError(getError(error)));
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
        .then((response: TableQueryResult) =>
          response.data.__type.fields.filter((element) =>
            isRelationship(element),
          ),
        )
        .catch((error): never => dispatchError(getError(error)))
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
      .catch((error): never => dispatchError(getError(error)));
  }
}

const apolloClient = new Apollo();

export default apolloClient;
