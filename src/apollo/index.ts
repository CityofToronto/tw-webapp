import ApolloClient from 'apollo-client';
import { NormalizedCacheObject, InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import _ from 'lodash';
import { link } from './lib/link';
import {
 TableTypes, TableQueryResult, TreeResponse, TreeStructure 
} from './types';
import { dispatchError } from './lib/utils';
import { listToTree } from './lib/listToTree';

class Apollo extends ApolloClient<NormalizedCacheObject> {
  public constructor() {
    super({
      link,
      cache: new InMemoryCache({
        addTypename: false,
      }),
    });
  }


  public getColumns(tableName: string): Promise<TableTypes[]> {
    return this.query({
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
      .then((response: TableQueryResult) => response.data.__type.fields.filter((element: { type: { ofType: { kind: string }; kind: string } }) => (element.type.ofType ? element.type.ofType.kind === 'SCALAR' : element.type.kind === 'SCALAR')))
      .catch((error): never => dispatchError(error));
  }


  public getRelationships(tableName: string): Promise<TableTypes[]> {
    return this.query({
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
      .then((response: TableQueryResult) => response.data.__type.fields.filter((element) => (element.type.ofType ? element.type.ofType.kind !== 'SCALAR' : element.type.kind !== 'SCALAR')))
      .catch((error): never => dispatchError(error));
  }

  public getValidTypes(tableName: string): Promise<string[]> {
    return this.query({
      query: gql`{
          ${tableName} {
            type
          }
        }`,
    })
      .then((response): string[] => response.data[tableName].map((x): string => x.type))
      .catch((error): never => dispatchError(error));
  }

  public async getHeirarchy(tableName: string): Promise<TreeResponse[]> {
    return this.query({
      query: gql`{
        ${tableName} {
          id
          name
          parent
        }
      }`,
    })
      .then((resp): TreeResponse[] => listToTree(resp.data[tableName]));
  }
}

const apolloClient = new Apollo();

export default apolloClient;
