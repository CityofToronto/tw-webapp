/**  Query One To Many Provider Class */

import gql from 'graphql-tag';
import { IServerSideDatasource } from 'ag-grid-community';
import { dispatchError, stringify } from '@/apollo/lib/utils';
import { GridProvider } from '../GridProviders';
import apolloClient from '@/apollo';
import { OTMDatasource } from './Datasources/OTMDatasource';
import { RowData, GridDataTransformer } from '@/types/grid';

export class OTMProvider implements GridProvider {
  public gridDatasource: IServerSideDatasource;

  private tableName: string;

  private relatedData: {
    tableName: string;
    rowId: number;
  };

  /**
   * Note that we pass in an object of relatedData, as objects are pass by reference
   * Therefore when we change that object outside the class, it will update all in here
   */
  public constructor(
    tableName: string,
    gridDataTransformer: GridDataTransformer,
    relatedData: { rowId: number; tableName: string },
  ) {
    this.tableName = tableName;
    this.relatedData = relatedData;
    this.gridDatasource = new OTMDatasource(tableName, gridDataTransformer, relatedData);
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
                ${stringify(rowData)},
                ${this.relatedData.tableName}_id: ${this.relatedData.rowId}
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

  /**
   * You have to delete from the table directly unlike querying where
   *  we passed through the tableName getting the relationship
   */
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

  // This is the same operation as a direct edit
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
      .catch((error): void => {
        dispatchError(error);
        failCallback();
      });
  }
}
