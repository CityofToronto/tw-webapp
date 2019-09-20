import { IServerSideGetRowsRequest } from 'ag-grid-community';
import gql from 'graphql-tag';
import apolloClient from '@/apollo';
import { dispatchError } from '@/apollo/lib/utils';
import GridDatasource from './GridDatasource';
import { GridDataTransformer, RowData, GridFilterModel } from '@/types/grid';

export default class MTMDatasource extends GridDatasource {
  private tableName: string;

  private relatedData: {
    tableName: string;
    rowId: number;
  };

  public constructor(
    tableName: string,
    customFilterModel: GridFilterModel,
    gridDataTransformer: GridDataTransformer,
    relatedData: { tableName: string; rowId: number },
  ) {
    super(tableName, customFilterModel, gridDataTransformer);
    this.tableName = tableName;
    this.relatedData = relatedData;
  }

  private get columnNames(): Promise<string[]> {
    return apolloClient
      .getColumns(this.tableName)
      .then((resp): string[] => resp.map((column): string => column.name));
  }

  // TODO This does not react to filters applied on the grid
  public countTotalRows(): Promise<number> {
    return apolloClient
      .query({
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
      })
      .then(
        (response): number =>
          response.data[
            `${this.relatedData.tableName}_${this.tableName}_aggregate`
          ].aggregate.count,
      )
      .catch((error): never => dispatchError(error));
  }

  /**
   * Here we query the linking table to get the ids, then query the table
   * where the ids match. This is the workaround to support filtering and sorting.
   * I recommend not to touch
   */
  public async getData(request: IServerSideGetRowsRequest): Promise<RowData[]> {
    const linkedQuery = await apolloClient
      .query({
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
      })
      .then(
        (response): { [key: string]: any }[] =>
          response.data[this.relatedData.tableName][0][
            `${this.relatedData.tableName}_${this.tableName}`
          ],
      );

    const linkedIds = linkedQuery.map(
      (col): number => col[`${this.tableName}_id`],
    );

    // We modify the request to filter for linkedIds
    const modifiedRequest = {
      ...request,
      filterModel: {
        id: {
          values: linkedIds,
          filterType: 'array',
        },
      },
    };

    return apolloClient
      .query({
        query: gql`
        query {
          ${await this.GridAdapter.buildQuery(modifiedRequest)}
        }`,
        fetchPolicy: 'network-only',
      })
      .then((response): RowData[] => response.data[this.tableName])
      .catch((error): never => dispatchError(error));
  }
}
