import { IServerSideDatasource, IServerSideGetRowsParams, IServerSideGetRowsRequest } from 'ag-grid-community';
import gql from 'graphql-tag';
import apolloClient from '@/apollo';
import { dispatchError } from '@/apollo/lib/utils';

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
    }).then((response): number => response.data[`${this.relatedData.tableName}_${this.tableName}_aggregate`].aggregate.count)
      .catch((error): never => dispatchError(error));
  }

  public async getData(request: IServerSideGetRowsRequest): Promise<object[]> {
    return apolloClient.query({
      query: gql`
        query getData {
          ${this.relatedData.tableName} (
            where: {
              id: {_eq: ${this.relatedData.rowId}}
            }
          ) {
            ${this.relatedData.tableName}_${this.tableName} {
              ${this.tableName} {
                ${await this.columnNames}
              }
            }
          }
        }`,
      fetchPolicy: 'network-only',
    }).then((response): object[] => response.data[this.relatedData.tableName][0][`${this.relatedData.tableName}_${this.tableName}`].map((x: object): object => x[this.tableName]))
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
