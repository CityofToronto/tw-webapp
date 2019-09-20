import { IServerSideGetRowsRequest } from 'ag-grid-community';
import gql from 'graphql-tag';
import apolloClient from '@/apollo';
import { dispatchError } from '@/apollo/lib/utils';
import GridDatasource from './GridDatasource';
import { GridDataTransformer, RowData, GridFilterModel } from '@/types/grid';

export class OTMDatasource extends GridDatasource {
  private tableName: string;

  private relatedData: {
    tableName: string;
    rowId: number;
  };

  public constructor(
    tableName: string,
    customFilterModel: GridFilterModel,
    dataTransformer: GridDataTransformer,
    relatedData: { tableName: string; rowId: number },
  ) {
    super(tableName, customFilterModel, dataTransformer);
    this.tableName = tableName;
    this.relatedData = relatedData;
  }

  public async countTotalRows(): Promise<number> {
    return apolloClient
      .query({
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
      })
      .then((resp): number => {
        // If nodes array is empty, there is no data and return a zero
        const nodesExist = !!resp.data[
          `${this.relatedData.tableName}_aggregate`
        ].nodes.length;
        // eslint-disable-next-line max-len
        return nodesExist
          ? resp.data[`${this.relatedData.tableName}_aggregate`].nodes[0][
              `${this.tableName}_aggregate`
            ].aggregate.count
          : 0;
      })
      .catch((error): never => dispatchError(error));
  }

  /**
   * We get the tableName values where relatedTable of id: relatedRowId
   *  Another approach would be get tableName where relatedTable_id equals relatedRowId
   */
  public async getData(request: IServerSideGetRowsRequest): Promise<RowData[]> {
    return apolloClient
      .query({
        query: gql`
        query {
          ${this.relatedData.tableName} (
            where: {
              id: {_eq: ${this.relatedData.rowId}},
            }
          ) {
            ${await this.GridAdapter.buildQuery(request)}
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .then(
        (response): RowData[] =>
          response.data[this.relatedData.tableName][0][this.tableName],
      )
      .catch((error): never => dispatchError(error));
  }
}
