import { GridApi, ColumnApi, IServerSideDatasource } from 'ag-grid-community';
import { RemoveQuery, AddQuery, UpdateQuery, RowData } from '@/apollo/types';
import { QueryType } from '@/types/api';
import { DirectProvider, MTMProvider, OTMProvider } from './GridProviders';
import {
  GridDataTransformer,
  GridFilterModel,
  ExtendedColDef,
} from '@/types/grid';
import BaseGridProvider from './GridProviders/Providers/BaseGridProvider';

export default class GridInstance {
  public gridApi: GridApi;

  public columnApi: ColumnApi;

  public Provider: BaseGridProvider;

  public constructor({
    Provider,
    gridApi,
    columnApi,
  }: {
    Provider: BaseGridProvider;
    gridApi: GridApi;
    columnApi: ColumnApi;
  }) {
    this.Provider = Provider;
    this.gridApi = gridApi;
    this.columnApi = columnApi;
  }

  /**
   * Shortcut to give back a pre-configured GridProvider. This function is
   * to be used when creating a grid instance
   */
  public static getProvider(
    queryType: QueryType,
    tableName: string,
    customFilterModel: GridFilterModel = {},
    relatedData: {
      tableName: string;
      rowId: number;
    },
    dataTransformer: GridDataTransformer,
  ): BaseGridProvider {
    const providers: { [key in QueryType]: BaseGridProvider } = {
      [QueryType.Direct]: new DirectProvider(
        tableName,
        customFilterModel,
        dataTransformer,
      ),
      [QueryType.OneToMany]: new OTMProvider(
        tableName,
        customFilterModel,
        dataTransformer,
        relatedData,
      ),
      [QueryType.ManyToMany]: new MTMProvider(
        tableName,
        customFilterModel,
        dataTransformer,
        relatedData,
      ),
    };
    return providers[queryType];
  }

  public get gridDatasource(): IServerSideDatasource {
    return this.Provider.gridDatasource;
  }

  public setGridUpdateEvent(updateEvent: (...args: any) => void): void {
    this.Provider.gridDatasource.setGridEvent(updateEvent);
  }

  public purgeCache(): void {
    this.gridApi.purgeServerSideCache();
  }

  public get columnDefs(): ExtendedColDef[] {
    return this.columnApi
      .getAllColumns()
      .map((column): ExtendedColDef => column.getColDef() as ExtendedColDef);
  }

  public sizeColumnsToFit(): void {
    this.gridApi.sizeColumnsToFit();
  }

  public autoSizeColumns(): void {
    const allColumnIds = this.columnApi
      .getAllColumns()
      .map((col): string => col.getColId());
    this.columnApi.autoSizeColumns(allColumnIds);
  }

  public getSelectedRows(): RowData[] {
    return this.gridApi.getSelectedRows();
  }

  /**
   * rowData will be an array of objects with key: value pairs
   * Return a successful and unsucessful callback for UI updates
   */
  public addRows({ rowsToAdd, successCallback, failCallback }: AddQuery): void {
    rowsToAdd.forEach((rowData): void =>
      this.Provider.addData(rowData, successCallback, failCallback),
    );
  }

  public removeRows({
    rowsToRemove,
    successCallback,
    failCallback,
  }: RemoveQuery): void {
    rowsToRemove.forEach((row): void =>
      this.Provider.removeData(row.id, successCallback, failCallback),
    );
  }

  public updateRows({
    rowsToUpdate,
    successCallback,
    failCallback,
  }: UpdateQuery): void {
    rowsToUpdate.forEach((row): void =>
      this.Provider.updateData(row, successCallback, failCallback),
    );
  }
}
