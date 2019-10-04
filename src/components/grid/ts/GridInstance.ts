import { AddQuery, RemoveQuery, UpdateQuery } from '@/apollo/types';
import { QueryType } from '@/types/api';
import {
  ExtendedColDef,
  GridDataTransformer,
  GridFilterModel,
  RowData,
} from '@/types/grid';
import {
  ColumnApi,
  GridApi,
  GridOptions,
  IServerSideDatasource,
} from 'ag-grid-community';
import { DirectProvider, MTMProvider, OTMProvider } from './GridProviders';
import BaseGridProvider from './GridProviders/Providers/BaseGridProvider';

export default class GridInstance {
  public gridApi: GridApi;

  public columnApi: ColumnApi;

  public gridProvider: BaseGridProvider;

  public gridOptions: GridOptions;

  public gridTitle: String = '';

  public constructor({
    gridApi,
    columnApi,
    gridOptions,
    gridProvider,
  }: {
    gridProvider: BaseGridProvider;
    gridApi: GridApi;
    columnApi: ColumnApi;
    gridOptions: GridOptions;
  }) {
    this.gridProvider = gridProvider;
    this.gridApi = gridApi;
    this.columnApi = columnApi;
    this.gridOptions = gridOptions;
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
    return this.gridProvider.gridDatasource;
  }

  public setGridUpdateEvent(updateEvent: (...args: any) => void): void {
    this.gridProvider.gridDatasource.setGridEvent(updateEvent);
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
   * Return a successful and unsuccessful callback for UI updates
   */
  public async addRows({
    rowsToAdd,
    successCallback,
    failCallback,
  }: AddQuery): Promise<void> {
    rowsToAdd.map((rowData): void => {
      this.gridProvider
        .addData(rowData, successCallback, failCallback)
        .then((response) =>
          this.gridApi.updateRowData({
            add: [response],
          }),
        );
    });
  }

  public removeRows({
    rowsToRemove,
    successCallback,
    failCallback,
  }: RemoveQuery): Promise<RowData>[] {
    return rowsToRemove.map(
      (row): Promise<RowData> =>
        this.gridProvider.removeData(row.id, successCallback, failCallback),
    );
  }

  public updateRows({
    rowsToUpdate,
    successCallback,
    failCallback,
  }: UpdateQuery): Promise<RowData>[] {
    return rowsToUpdate.map(
      (row): Promise<RowData> =>
        this.gridProvider.updateData(row, successCallback, failCallback),
    );
  }
}
