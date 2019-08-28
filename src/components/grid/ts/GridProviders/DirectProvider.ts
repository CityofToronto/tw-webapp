/** This provider queries the table directly, not through some relationship */
import gql from 'graphql-tag';
import { IServerSideDatasource } from 'ag-grid-community';
import { GridProvider } from '../GridProviders';
import apolloClient from '@/apollo';
import { dispatchError, stringify } from '@/apollo/lib/utils';
import { QueryError, RowData } from '@/apollo/types';
import { DirectDatasource } from './Datasources/DirectDatasource';

export class DirectProvider implements GridProvider {
  /**
   * Methods to add, remove and update data.
   * Additionally provides a ServerSideDatasource for Ag-Grid
   *
   * @param tableName - The name of the table in the database
   * @returns Instance with add, remove, update and Serverside Datasource
   */
  private tableName: string;

  public gridDatasource: IServerSideDatasource;

  public constructor(
    tableName: string,
  ) {
    this.tableName = tableName;
    this.gridDatasource = new DirectDatasource(tableName);
  }

  public addData(
    rowData: RowData,
    successCallback: () => void = (): void => {},
    failCallback: () => void = (): void => {},
  ): void {
    apolloClient.mutate({
      mutation: gql`
        mutation {
          insert_${this.tableName} (
            objects: {
              ${stringify(rowData)}
            }
          ) {
            affected_rows
          }
        }`,
    }).then((): void => {
      successCallback();
    }).catch((error): void => {
      failCallback();
      dispatchError(error);
    });
  }

  public removeData(
    idToDelete: number,
    successCallback: () => void = (): void => {},
    failCallback: () => void = (): void => {},
  ): void {
    apolloClient.mutate({
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
      .catch((error: QueryError): void => {
        failCallback();
        dispatchError(error);
      });
  };

  public updateData(
    rowToUpdate: RowData,
    successCallback: () => void = (): void => {},
    failCallback: () => void = (): void => {},
  ): void {
    apolloClient.mutate({
      mutation: gql`
      mutation updateRow {
      update_${this.tableName} (
        where: {
          id: { _eq: ${rowToUpdate.id} }
        },
        _set: {
          ${stringify(rowToUpdate)}
        }
      ) {
        returning {
          ${Object.keys(rowToUpdate)}
        }
      }
    }`,
    })
      .then((): void => {
        successCallback();
      })
      .catch((error: QueryError): void => {
        dispatchError(error);
        failCallback();
      });
  }
}
