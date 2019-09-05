import { IServerSideGetRowsRequest } from 'ag-grid-community';
import gql from 'graphql-tag';
import apolloClient from '@/apollo';
import { dispatchError } from '@/apollo/lib/utils';
import { GridDataTransformer, RowData } from '@/types/grid';
import GridDatasource from './GridDatasource';

export class DirectDatasource extends GridDatasource {
  private tableName: string;

  public constructor(tableName: string, dataTransformer: GridDataTransformer) {
    super(dataTransformer, tableName);
    this.tableName = tableName;
  }

  protected async countTotalRows(request: IServerSideGetRowsRequest): Promise<number> {
    return apolloClient
      .query({
        query: gql`
          query countRows {
            ${this.tableName}_aggregate (
              where: ${await this.GridAdapter.constructFilterModel(
                request.filterModel,
                request.groupKeys,
              )}
            ){
              aggregate {
                count
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .then((response): number => response.data[`${this.tableName}_aggregate`].aggregate.count)
      .catch((error): never => dispatchError(error));
  }

  protected async getData(request: IServerSideGetRowsRequest): Promise<RowData[]> {
    return apolloClient
      .query({
        query: gql` {
           ${await this.GridAdapter.buildQuery(request)}
        }
        `,
        fetchPolicy: 'network-only',
      })
      .then((response): RowData[] => response.data[this.tableName])
      .catch((error): never => dispatchError(error));
  }
}
