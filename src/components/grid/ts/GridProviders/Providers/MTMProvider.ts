import apolloClient from '@/apollo';
import { dispatchError } from '@/apollo/lib/utils';
import { GridDataTransformer, GridFilterModel, RowData } from '@/types/grid';
import gql from 'graphql-tag';
import GridDatasource from '../Datasources/GridDatasource';
import MTMDatasource from '../Datasources/MTMDatasource';
import BaseGridProvider from './BaseGridProvider';

export class MTMProvider extends BaseGridProvider {
  public gridDatasource: GridDatasource;

  private relatedData: {
    tableName: string;
    rowId: number;
  };

  private linkingTableName: string;

  public constructor(
    tableName: string,
    customFilterModel: GridFilterModel,
    gridDataTransformer: GridDataTransformer,
    relatedData: {
      tableName: string;
      rowId: number;
    },
  ) {
    super(tableName);
    this.relatedData = relatedData;
    this.gridDatasource = new MTMDatasource(
      this.tableName,
      customFilterModel,
      gridDataTransformer,
      this.relatedData,
    );
    this.linkingTableName = `${this.relatedData.tableName}_${this.tableName}`;
  }

  public async getData(): Promise<RowData[]> {
    return [];
  }

  // Row to add in this case is just an ID
  // We create a link in the linking table
  // @ts-ignore
  public async addData(
    rowToAdd: RowData,
    successCallback: () => void = (): void => {},
    failCallback: () => void = (): void => {},
  ): Promise<void> {
    apolloClient
      .mutate({
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
      .then((response): void => {
        successCallback();
        return response.data[`insert_${this.tableName}`].returning[0];
      })
      .catch((error): never => dispatchError(error));
  }

  // Opposite of adding a row, filter for where ids match and delete entry'
  // @ts-ignore
  public removeData(
    idToDelete: string,
    successCallback: () => void = (): void => {},
    failCallback: () => void = (): void => {},
  ): void {
    apolloClient
      .mutate({
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

  // @ts-ignore
  public updateData(
    rowToUpdate: RowData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _successCallback: () => void = (): void => {},
    failCallback: () => void = (): void => {},
  ): void {
    failCallback();
    throw new Error("ERROR: Can't update data on a many to many relationship");
  }
}
