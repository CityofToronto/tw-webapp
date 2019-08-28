import {
  IServerSideDatasource, IServerSideGetRowsRequest, IServerSideGetRowsParams,
} from 'ag-grid-community';
import gql from 'graphql-tag';
import apolloClient from '@/apollo';
import { dispatchError, constructFilter } from '@/apollo/lib/utils';

export class OTMDatasource implements IServerSideDatasource {
  private tableName: string;

  private relatedData: {
    tableName: string;
    rowId: number;
  }

  public constructor(
    tableName: string,
    relatedData: { tableName: string; rowId: number },
  ) {
    this.tableName = tableName;
    this.relatedData = relatedData;
  }

  private get columnNames(): Promise<string[]> {
    return apolloClient.getColumns(this.tableName)
      .then((resp): string[] => resp.map((column): string => column.name));
  }

  public async countTotalRows(): Promise<number> {
    return apolloClient.query({
      query: gql`
        query {
          ${this.relatedData.tableName}_aggregate (
            where: {
              id: {_eq: ${this.relatedData.rowId}}
            }
          ) {
            nodes {
              ${this.tableName}_aggregate {
                aggregate {
                  count
                }
              }
            }
          }
        }`,
      fetchPolicy: 'network-only',
    }).then((resp): number => {
      // If nodes array is empty, there is no data and return a zero
      const nodesExist = !!resp.data[`${this.relatedData.tableName}_aggregate`].nodes.length;
      // eslint-disable-next-line max-len
      return nodesExist ? resp.data[`${this.relatedData.tableName}_aggregate`].nodes[0][`${this.tableName}_aggregate`].aggregate.count : 0;
    })
      .catch((error): never => dispatchError(error));
  }

  /**
   * We get the tableName values where relatedTable of id: relatedRowId
   *  Another approach would be get tableName where relatedTable_id equals relatedRowId
   */
  public async getData(request: IServerSideGetRowsRequest): Promise<object[]> {
    const sortModel = request.sortModel
      .map((element: {colId: string; sort: string}): string => `${element.colId}: ${element.sort},`);


    return apolloClient.query({
      query: gql`
        query {
          ${this.relatedData.tableName} (
            where: {
              id: {_eq: ${this.relatedData.rowId}},
            }
          ) {
            ${this.tableName} (
              offset: ${request.startRow},
              limit: ${request.endRow},
              where:  ${constructFilter(request.filterModel)},
              order_by: {
                ${sortModel}
              }
            ) {
              ${await this.columnNames}
            }
          }
        }
      `,
      fetchPolicy: 'network-only',
    }).then((response): object[] => response.data[this.relatedData.tableName][0][this.tableName])
      .catch((error): never => dispatchError(error));
  }

  public async getRows(params: IServerSideGetRowsParams): Promise<void> {
    const numberOfRows = await this.countTotalRows();
    const rowData = await this.getData(params.request);

    if (rowData) {
      params.successCallback(rowData, numberOfRows);
    } else {
      params.failCallback();
    }
  }
}
