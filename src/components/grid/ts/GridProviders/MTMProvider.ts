
import gql from 'graphql-tag';
import { IServerSideDatasource } from 'ag-grid-community';
import { GridProvider } from '../GridProviders';
import MTMDatasource from './Datasources/MTMDatasource';
import { RowData } from '@/apollo/types';
import apolloClient from '@/apollo';
import { dispatchError } from '@/apollo/lib/utils';

export class MTMProvider implements GridProvider {
  public gridDatasource: IServerSideDatasource;

  private tableName: string;

  private relatedData: {
    tableName: string;
    rowId: number;
  }

  private linkingTableName: string;

  public constructor(
    tableName: string,
    relatedData: {
      tableName: string;
      rowId: number;
    },
  ) {
    this.tableName = tableName;
    this.relatedData = relatedData;
    this.gridDatasource = new MTMDatasource(
      this.tableName,
      this.relatedData,
    );
    this.linkingTableName = `${this.relatedData.tableName}_${this.tableName}`;
  }

  // Row to add in this case is just an ID
  // We create a link in the linking table
  public addData(
    rowToAdd: RowData,
    successCallback: () => void = (): void => {},
    failCallback: () => void = (): void => {},
  ): void {
    apolloClient.mutate({
      mutation: gql`
        mutation {
          insert_${this.linkingTableName} (
            objects: {
              ${this.relatedData.tableName}_id: ${this.relatedData.rowId},
              ${this.tableName}_id: ${rowToAdd.id},
            }
          ) {
            affected_rows
          }
        }
      `,
    })
      .then((): void => {
        successCallback();
      })
      .catch((error): void => {
        failCallback();
        dispatchError(error);
      });
  }

  // Opposite of adding a row, filter for where ids match and delete entry'
  public removeData(
    idToDelete: number,
    successCallback: () => void = (): void => {},
    failCallback: () => void = (): void => {},
  ): void {
    apolloClient.mutate({
      mutation: gql`
        mutation {
          delete_${this.linkingTableName} (
            where: {
              ${this.relatedData.tableName}_id: {_eq: ${this.relatedData.rowId}},
              ${this.tableName}_id: {_eq: ${idToDelete}},
            }
          ) {
            affected_rows
          }
        }
      `,
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
  ) {
    // TODO Implement?
  }
}
