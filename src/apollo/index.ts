import ApolloClient from 'apollo-client';
import { NormalizedCacheObject, InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import { link } from './lib/link';
import { TableTypes, TableQueryResult, TreeResponse } from './types';
import { dispatchError } from './lib/utils';
import _ from 'lodash';

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
      }`
    })
      .then((resp) => listToTree(resp.data[tableName]));
  }
}

const listToTree = (data, options) => {
  options = options || {};
  const ID_KEY = options.idKey || 'id';
  const PARENT_KEY = options.parentKey || 'parent';
  const CHILDREN_KEY = options.childrenKey || 'children';
  
  var tree = [], childrenOf = {};
  var item, id, parentId;

  for(var i = 0, length = data.length; i < length; i++) {
    item = data[i];
    id = item[ID_KEY];
    parentId = item[PARENT_KEY] || 0;
    // every item may have children
    childrenOf[id] = childrenOf[id] || [];
    // init its children
    item[CHILDREN_KEY] = childrenOf[id];
    if (parentId != 0) {
      // init its parent's children object
      childrenOf[parentId] = childrenOf[parentId] || [];
      // push it into its parent's children object
      childrenOf[parentId].push(item);
    } else {
      tree.push(item);
    }    
  };

  return tree;
}

//{
  //           id: 1,
  //           name: 'Root',
  //           children: [
  //             { id: 2, name: 'Child #1' },
  //             { id: 3, name: 'Child #2' },
  //             {
  //               id: 4,
  //               name: 'Child #3',
  //               children: [
  //                 { id: 5, name: 'Grandchild #1' },
  //                 { id: 6, name: 'Grandchild #2' },
  //               ],
  //             },
  //           ],
  //         },
  //       ],

  // [
  //   {
  //     "parent": null,
  //     "children": [
  //       {
  //         "id": 2,
  //         "type": "Level 2"
  //       }
  //     ],
  //     "type": "Level 1"
  //   },
  //   {
  //     "parent": 1,
  //     "children": [],
  //     "type": "Level 2"
  //   }
  // ]

const apolloClient = new Apollo();

export default apolloClient;
