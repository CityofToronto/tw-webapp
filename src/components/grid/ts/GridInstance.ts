import {
  GridApi, ColumnApi, ColDef, IServerSideDatasource,
} from 'ag-grid-community';
import {
  RemoveQuery, AddQuery, QueryType, UpdateQuery, RowData,
} from '@/apollo/types';
import {
  GridProvider, DirectProvider, MTMProvider, OTMProvider,
} from './GridProviders';

export default class GridInstance {
  public gridApi: GridApi;

  public columnApi: ColumnApi;

  public Provider: GridProvider;

  public constructor({
    Provider, gridApi, columnApi,
  }: {
    Provider: GridProvider;
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
    relatedData: {
      tableName: string;
      rowId: number;
    },
  ): GridProvider {
    const providers: {[key in QueryType]: GridProvider} = {
      [QueryType.Direct]: new DirectProvider(tableName),
      [QueryType.ManyToMany]: new MTMProvider(tableName, relatedData),
      [QueryType.OneToMany]: new OTMProvider(tableName, relatedData),
    };
    return providers[queryType];
  }

  public get gridDatasource(): IServerSideDatasource {
    return this.Provider.gridDatasource;
  }

  public purgeCache(): void {
    this.gridApi.purgeServerSideCache();
  }

  public get columnDefs(): ColDef[] {
    return this.columnApi.getAllColumns().map((column): ColDef => column.getColDef());
  }

  public sizeColumnsToFit(): void {
    this.gridApi.sizeColumnsToFit();
  }

  public autoSizeColumns(): void {
    const allColumnIds = this.columnApi.getAllColumns().map((col): string => col.getColId());
    this.columnApi.autoSizeColumns(allColumnIds);
  }

  public getSelectedRows(): RowData[] {
    return this.gridApi.getSelectedRows();
  }

  /**
   * rowData will be an array of objects with key: value pairs
   * Return a successful and unsucessful callback for UI updates
   */
  public addRows(
    { rowsToAdd, successCallback, failCallback }: AddQuery,
  ): void {
    rowsToAdd.forEach((rowData): void => this.Provider.addData(rowData, successCallback, failCallback));
  }

  public removeRows(
    { rowsToRemove, successCallback, failCallback }: RemoveQuery,
  ): void {
    rowsToRemove.forEach((row): void => this.Provider.removeData(row.id, successCallback, failCallback));
  }

  public updateRows(
    { rowsToUpdate, successCallback, failCallback }: UpdateQuery,
  ): void {
    rowsToUpdate.forEach((row): void => this.Provider.updateData(row, successCallback, failCallback));
  }
}