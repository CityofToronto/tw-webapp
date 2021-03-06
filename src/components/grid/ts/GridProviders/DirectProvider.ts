/** This provider queries the table directly, not through some relationship */
import gql from 'graphql-tag';
import BaseGridProvider from './BaseGridProvider';
import apolloClient from '@/apollo';
import { dispatchError, stringify } from '@/apollo/lib/utils';
import { RowData, RequiredConfig } from '@/types/grid';
import GridInstance from '../GridInstance';

interface RowToUpdateQuery {
  where?: Record<string, string | number>;
  data: Record<string, any>;
}

/**
 * Methods to add, remove and update data.
 * Additionally provides a ServerSideDatasource for Ag-Grid
 *
 * @param tableName - The name of the table in the database
 * @param customFilterModel
 * @param gridTransformer
 * @returns Instance with add, remove, update and Serverside Datasource
 */
export class DirectProvider extends BaseGridProvider {
  public constructor(config: RequiredConfig) {
    super(config);
  }

  public async subscribeToData(gridInstance: GridInstance) {
    this.subscription = apolloClient
      .subscribe({
        query: gql` 
        subscription {
          ${this.tableName} (order_by: {id: asc}) {
            ${await this.getColumnNames()}
          }
        }
      `,
      })
      .subscribe({
        next: ({ data }) => {
          // Refresh all custom cell renderers
          gridInstance.gridApi.setRowData(data[this.tableName]);
        },
      });
  }

  public async getData(): Promise<RowData[]> {
    return apolloClient
      .query({
        query: gql` {
          ${this.tableName} (order_by: {id: asc}) {
            ${await this.getColumnNames()}
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .then((response): RowData[] => response.data[this.tableName])
      .catch((error): never => dispatchError(error));
  }

  public async addData(rowData: RowData): Promise<RowData> {
    return apolloClient
      .mutate({
        mutation: gql`
        mutation {
          insert_${this.tableName} (
            objects: {
              ${stringify(rowData, this.tableID)}
            }
          ) {
            returning {
              ${await this.getColumnNames()}
            }
          }
        }`,
      })
      .then(
        (response): RowData =>
          response.data[`insert_${this.tableName}`].returning[0],
      )
      .catch((error): never => dispatchError(error));
  }

  public async removeData(idToDelete: string): Promise<RowData> {
    return apolloClient
      .mutate({
        mutation: gql`
        mutation {
          delete_${this.tableName}(
            where: {
              id: {_eq: ${idToDelete}}
          }) {
            returning {
              ${await this.getColumnNames()}
            }
          }
        }`,
      })
      .then(
        (response): RowData =>
          response.data[`delete_${this.tableName}`].returning[0],
      )
      .catch((error): never => dispatchError(error));
  }

  public async updateData(
    data: RowData,
    where?: [string, string | number],
  ): Promise<RowData> {
    const whereId = where ? where[0] : 'id';
    const whereValue = where ? where[1] : data.id;

    return apolloClient
      .mutate({
        mutation: gql`
        mutation updateRow {
          update_${this.tableName} (
            where: {
              ${whereId}: { _eq: ${whereValue} }
            },
            _set: {
              ${stringify(data, this.tableID)}
            }
            ) {
              returning {
                ${await this.getColumnNames()}
              }
            }
        }`,
      })
      .then(
        (response): RowData =>
          response.data[`update_${this.tableName}`].returning[0] ||
          response.data[`update_${this.tableName}`].returning,
      )
      .catch((error): never => dispatchError(error));
  }
}
