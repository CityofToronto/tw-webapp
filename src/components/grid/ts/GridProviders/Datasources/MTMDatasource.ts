import {
  IServerSideDatasource, IServerSideGetRowsParams, IServerSideGetRowsRequest,
} from 'ag-grid-community';
import gql from 'graphql-tag';
import apolloClient from '@/apollo';
import { dispatchError, constructFilter } from '@/apollo/lib/utils';

export default class MTMDatasource implements IServerSideDatasource {
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

  public countTotalRows(): Promise<number> {
    return apolloClient.query({
      query: gql`
        query countRows {
          ${this.relatedData.tableName}_${this.tableName}_aggregate(
            where: {
              ${this.relatedData.tableName}_id: {_eq: "${this.relatedData.rowId}"}
            }
          ) {
            aggregate {
              count
            }
          }
        }
      `,
      fetchPolicy: 'network-only',
    // eslint-disable-next-line max-len
    }).then((response): number => response.data[`${this.relatedData.tableName}_${this.tableName}_aggregate`].aggregate.count)
      .catch((error): never => dispatchError(error));
  }

  /**
   * Here we query the linking table to get the ids, then query the table
   * where the ids match. This is the workaround to support filtering and sorting.
   * I recommend not to touch
   */
  public async getData(request: IServerSideGetRowsRequest): Promise<object[]> {
    const sortModel = request.sortModel
      .map((element: {colId: string; sort: string}): string => `${element.colId}: ${element.sort},`);

    const linkedQuery = await apolloClient.query({
      query: gql`
        query getData {
          ${this.relatedData.tableName} (
            where: {
               id: {_eq: ${this.relatedData.rowId}}
             }
          ) {
            ${this.relatedData.tableName}_${this.tableName} {
              ${this.tableName}_id
            }
          }
        }`,
      fetchPolicy: 'network-only',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, max-len
    }).then((response): {[key: string]: any}[] => response.data[this.relatedData.tableName][0][`${this.relatedData.tableName}_${this.tableName}`]);

    const linkedIds = linkedQuery.map((col): number => col[`${this.tableName}_id`]);

    const appendedFilter = {
      ...request.filterModel,
      id: {
        values: linkedIds,
        filterType: 'array',
      },
    };

    return apolloClient.query({
      query: gql`
        query {
          ${this.tableName} (
            offset: ${request.startRow},
              limit: ${request.endRow},
              where:  ${constructFilter(appendedFilter)},
              order_by: {
                ${sortModel}
              }
          ) {
            ${await this.columnNames}
          }
        }`,
      fetchPolicy: 'network-only',
    }).then((response): object[] => response.data[this.tableName])
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
