
import gql from 'graphql-tag';
import { IServerSideDatasource, GridApi } from 'ag-grid-community';
import { GridProvider } from '.';
import MTMDatasource from './Datasources/MTMDatasource';
import { RowData } from '@/apollo/types';

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
    gridApi: GridApi,
  ) {
    this.tableName = tableName;
    this.relatedData = relatedData;
    this.gridDatasource = new MTMDatasource(
      this.tableName,
      this.relatedData,
      gridApi,
    );
  }

  // TODO
  public addData(
    rowToAdd: RowData,
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
    rowToUpdate: RowData,
    successCallback?: () => void = (): void => {},
    failCallback?: () => void = (): void => {},
  ): void {

  }
}
