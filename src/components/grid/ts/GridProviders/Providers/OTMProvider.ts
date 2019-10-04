/**  Query One To Many Provider Class */

import gql from 'graphql-tag';
import { dispatchError, stringify } from '@/apollo/lib/utils';
import BaseGridProvider from './BaseGridProvider';
import apolloClient from '@/apollo';
import { OTMDatasource } from '../Datasources/OTMDatasource';
import { RowData, GridDataTransformer, GridFilterModel } from '@/types/grid';
import GridDatasource from '../Datasources/GridDatasource';

export class OTMProvider extends BaseGridProvider {
  public gridDatasource: GridDatasource;

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
    customFilterModel: GridFilterModel,
    gridDataTransformer: GridDataTransformer,
    relatedData: { rowId: number; tableName: string },
  ) {
    super(tableName);
    this.relatedData = relatedData;
    this.gridDatasource = new OTMDatasource(
      tableName,
      customFilterModel,
      gridDataTransformer,
      relatedData,
    );
  }

  public async getData(): Promise<RowData[]> {
    return [];
  }

  public async addData(
    rowData: RowData,
    successCallback: () => void = (): void => {},
    failCallback: () => void = (): void => {},
  ): Promise<RowData> {
    return apolloClient
      .mutate({
        mutation: gql`
          mutation {
            insert_${this.tableName} (
              objects: {
                ${stringify(rowData, this.tableName)},
                ${this.relatedData.tableName}_id: ${this.relatedData.rowId}
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

  /**
   * You have to delete from the table directly unlike querying where
   *  we passed through the tableName getting the relationship
   */
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

  // This is the same operation as a direct edit
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
          ${Object.keys(rowToUpdate)}
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
