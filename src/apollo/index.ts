import ApolloClient from 'apollo-client';
import { NormalizedCacheObject, InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import { link } from './lib/link';
import { dispatchError } from './lib/utils';
import {
  HasuraField,
  TableQueryResult,
  HasuraTypeResult,
  HasuraWhere,
  __Types,
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

  public async getTypename(tableName: string): Promise<string> {
    return this.query({
      query: gql`
      query getTypename {
        ${tableName} {
          __typename
        }
      }`,
    }).then((response) => response.data[tableName][0].__typename);
  }

  public async getFields(typename: string) {
    return this.query<HasuraTypeResult>({
      query: gql`
        {
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

  async getQueryFields(tableName: string) {
    const fieldsTo = (fields: HasuraField[]) => {
      return fields.map((field) => getType(field.type, field.name));
    };

    const typeNameToFields = async (typename: string) => {
      const fields = await this.getFields(typename);
      return await Promise.all(fieldsTo(fields));
    };

    // Declared as function to be hoisted
    async function getType(type: __Types, name?: string) {
      switch (type.kind) {
        case 'ENUM':
        case 'SCALAR':
          return name;
        case 'NON_NULL':
          return await getType(type.ofType, name);
        case 'LIST':
          return `${name} {${await getType(type.ofType)}}`;
        case 'OBJECT':
          return await typeNameToFields(type.name);
      }
    }
    return typeNameToFields(await this.getTypename(tableName));
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

  public async queryTable(tableName: string, where?: HasuraWhere) {
    const argsString = where ? `(where: {id: {_eq: ${where.id._eq}}})` : '';
    return this.query({
      query: gql`
      {
        ${tableName} ${argsString} {
          ${await this.getQueryFields(tableName)}
        }
      }`,
    })
      .then((resp) => resp.data[tableName][0])
      .catch(dispatchError);
  }
}

const apolloClient = new Apollo();

export default apolloClient;
