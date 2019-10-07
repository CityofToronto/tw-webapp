/** This provider queries the table directly, not through some relationship */
import gql from 'graphql-tag';
import BaseGridProvider from './BaseGridProvider';
import apolloClient from '@/apollo';
import { dispatchError, stringify } from '@/apollo/lib/utils';
import { DirectDatasource } from '../Datasources/DirectDatasource';
import { GridDataTransformer, GridFilterModel, RowData } from '@/types/grid';
import GridDatasource from '../Datasources/GridDatasource';
import GridInstance from '../../GridInstance';

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
  public gridDatasource: GridDatasource;

  public constructor(
    tableName: string,
    customFilterModel: GridFilterModel,
    gridDataTransformer: GridDataTransformer,
  ) {
    super(tableName);
    this.gridDatasource = new DirectDatasource(
      tableName,
      customFilterModel,
      gridDataTransformer,
    );
  }

  public async subscribeToData(gridInstance: GridInstance): void {
    apolloClient.subscribe({
      query: gql` {
        ${this.tableName} {
          ${await this.getColumnNames()}
        }
      }`,
    });
  }

  public async getData(): Promise<RowData[]> {
    return apolloClient
      .query({
        query: gql` {
          ${this.tableName} {
            ${await this.getColumnNames()}
          }
      }`,
      })
      .then((response): RowData[] => response.data[this.tableName])
      .catch((error): never => dispatchError(error));
  }

  public async addData(
    rowData: RowData,
    successCallback: () => void = (): void => {},
    failCallback: () => never = (): never => {
      throw Error('Call Failed');
    },
  ): Promise<RowData> {
    return apolloClient
      .mutate({
        mutation: gql`
        mutation {
          insert_${this.tableName} (
            objects: {
              ${stringify(rowData, this.tableName)}
            }
          ) {
            returning {
              ${await this.getColumnNames()}
            }
          }
        }`,
      })
      .then(
        (response): RowData => {
          successCallback();
          return response.data[`insert_${this.tableName}`].returning[0];
        },
      )
      .catch((error): never => dispatchError(error));
  }

  public async removeData(
    idToDelete: string,
    successCallback: () => void = (): void => {},
    failCallback: () => void = (): void => {},
  ): Promise<RowData> {
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
        (response): RowData => {
          successCallback();
          return response.data[`delete_${this.tableName}`].returning[0];
        },
      )
      .catch((error): never => dispatchError(error));
  }

  public async updateData(
    rowToUpdate: RowData,
    successCallback: () => void = (): void => {},
    failCallback: () => void = (): void => {},
  ): Promise<RowData> {
    return apolloClient
      .mutate({
        mutation: gql`
        mutation updateRow {
          update_${this.tableName} (
            where: {
              id: { _eq: ${rowToUpdate.id} }
            },
            _set: {
              ${stringify(rowToUpdate, this.tableName)}
            }
            ) {
              returning {
                ${await this.getColumnNames()}
              }
            }
        }`,
      })
      .then(
        (response): RowData => {
          successCallback();
          return response.data[`update_${this.tableName}`].returning[0];
        },
      )
      .catch((error): never => dispatchError(error));
  }
}
