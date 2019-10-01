/** This provider queries the table directly, not through some relationship */
import gql from 'graphql-tag';
import BaseGridProvider from './BaseGridProvider';
import apolloClient from '@/apollo';
import { dispatchError, stringify } from '@/apollo/lib/utils';
import { RowData } from '@/apollo/types';
import { DirectDatasource } from '../Datasources/DirectDatasource';
import { GridDataTransformer, GridFilterModel } from '@/types/grid';
import GridDatasource from '../Datasources/GridDatasource';

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
  private tableName: string;

  public gridDatasource: GridDatasource;

  public constructor(
    tableName: string,
    customFilterModel: GridFilterModel,
    gridDataTransformer: GridDataTransformer,
  ) {
    super();
    this.tableName = tableName;
    this.gridDatasource = new DirectDatasource(
      tableName,
      customFilterModel,
      gridDataTransformer,
    );
  }

  public addData(
    rowData: RowData,
    successCallback: () => void = (): void => {},
    failCallback: () => void = (): void => {},
  ): void {
    apolloClient
      .mutate({
        mutation: gql`
        mutation {
          insert_${this.tableName} (
            objects: {
              ${stringify(rowData, this.tableName)}
            }
          ) {
            affected_rows
          }
        }`,
      })
      .then((): void => {
        successCallback();
      })
      .catch((error): void => {
        failCallback();
        dispatchError(error);
      });
  }

  public removeData(
    idToDelete: number,
    successCallback: () => void = (): void => {},
    failCallback: () => void = (): void => {},
  ): void {
    apolloClient
      .mutate({
        mutation: gql`
        mutation {
          delete_${this.tableName}(
            where: {
              id: {_eq: ${idToDelete}}
          }) {
            affected_rows
          }
        }`,
      })
      .then((): void => {
        successCallback();
      })
      .catch((error): void => {
        failCallback();
        dispatchError(error);
      });
  }

  public updateData(
    rowToUpdate: RowData,
    successCallback: () => void = (): void => {},
    failCallback: () => void = (): void => {},
  ): void {
    apolloClient
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
              affected_rows
            }
        }`,
      })
      .then((): void => {
        successCallback();
      })
      .catch((error): void => {
        failCallback();
        dispatchError(error);
      });
  }
}
