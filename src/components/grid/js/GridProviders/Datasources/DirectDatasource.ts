import {
  IServerSideDatasource, IServerSideGetRowsRequest, IServerSideGetRowsParams, GridApi,
} from 'ag-grid-community';
import gql from 'graphql-tag';
import apolloClient from '@/apollo';
import { dispatchError, constructFilter } from '@/apollo/lib/utils';

export class DirectDatasource implements IServerSideDatasource {
  private tableName: string;

  public constructor(tableName: string) {
    this.tableName = tableName;
  }

  private get columnNames(): Promise<string[]> {
    return apolloClient.getColumns(this.tableName)
      .then((resp): string[] => resp.map((column): string => column.name));
  }

  private async countTotalRows(request: IServerSideGetRowsRequest): Promise<number> {
    return apolloClient.query({
      query: gql`
          query countRows {
            ${this.tableName}_aggregate (
              where: ${constructFilter(request.filterModel)} 
            ){
              aggregate {
                count
              }
            }
          }
        `,
      fetchPolicy: 'network-only',
    }).then((response): number => response.data[`${this.tableName}_aggregate`].aggregate.count)
      .catch((error): never => dispatchError(error));
  }

  public async getData(request: IServerSideGetRowsRequest): Promise<object[]> {
    const sortModel = request.sortModel
      .map((element: {colId: string; sort: string}): string => `${element.colId}: ${element.sort},`);

    return apolloClient.query({
      query: gql`
          query GetRows(
            $startRow: Int,
            $endRow: Int,
          ) {
            ${this.tableName}(
              offset: $startRow,
              limit: $endRow
              order_by: {${sortModel}}
              where: ${constructFilter(request.filterModel)}
            ) {
              ${await this.columnNames}
            }
          }
        `,
      variables: {
        startRow: request.startRow,
        endRow: request.endRow,
      },
      fetchPolicy: 'network-only',
    }).then((response): object[] => response.data[this.tableName])
      .catch((error): never => dispatchError(error));
  }

  public async getRows(params: IServerSideGetRowsParams): Promise<void> {
    const numberOfRows = await this.countTotalRows(params.request);
    const rowData = await this.getData(params.request);

    if (rowData) {
      params.successCallback(rowData, numberOfRows);
    } else {
      params.failCallback();
    }
  }
}
