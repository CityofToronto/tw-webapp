
import gql from 'graphql-tag';
import { IServerSideDatasource } from 'ag-grid-community';
import { GridProvider } from '.';
import MTMDatasource from './Datasources/MTMDatasource';

export class MTMProvider implements GridProvider {
  public gridDatasource: IServerSideDatasource;

  private tableName: string;

  private relatedData: {
    tableName: string;
    rowId: number;
  }

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
  }

  // TODO
  public addData(
    rowData: {[key: string]: string | number | boolean},
    successCallback: () => void = (): void => {},
    failCallback: () => void = (): void => {},
  ): void {

  }

  // TODO
  public removeData(
    idToDelete: number,
    successCallback?: () => void = (): void => {},
    failCallback?: () => void = (): void => {},
  ): void {

  }

  public updateData(
    idToUpdate: number,
    newData: {[key: string]: string | number | boolean},
    successCallback?: () => void = (): void => {},
    failCallback?: () => void = (): void => {},
  ): void {

  }
}
