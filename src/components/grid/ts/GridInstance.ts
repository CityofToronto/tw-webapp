import { AddQuery, RemoveQuery, UpdateQuery } from '@/apollo/types';
import { QueryType } from '@/types/api';
import { ExtendedColDef, RowData, RequiredConfig } from '@/types/grid';
import { ColumnApi, GridApi, GridOptions } from 'ag-grid-community';
import { DirectProvider, OTMProvider } from './GridProviders';
import BaseGridProvider from './GridProviders/BaseGridProvider';
import ComponentApi from './componentApi';
import _ from 'lodash';

export default class GridInstance {
  public gridApi: GridApi;

  public columnApi: ColumnApi;

  public gridProvider: BaseGridProvider;

  public gridOptions: GridOptions;

  public componentApi: ComponentApi;

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
    this.componentApi = new ComponentApi(this);
  }

  /**
   * Shortcut to give back a pre-configured GridProvider. This function is
   * to be used when creating a grid instance
   */
  public static getProvider(
    queryType: QueryType,
    config: RequiredConfig,
    relatedData: {
      tableName: string;
      rowId: number;
    },
  ): BaseGridProvider {
    const providers: { [key in QueryType]: BaseGridProvider } = {
      [QueryType.Direct]: new DirectProvider(config),
      [QueryType.OneToMany]: new OTMProvider(config, relatedData),
      [QueryType.ManyToMany]: new OTMProvider(config, relatedData), // TODO CHANGE THIS TO MTM
    };
    return providers[queryType];
  }

  public forceUpdateData() {
    this.gridProvider
      .getData()
      .then((response) => this.gridApi.setRowData(response));
  }

  public subscribeToMore() {
    return this.gridProvider.subscribeToData(this);
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
  public async addRows({ rowsToAdd }: AddQuery): Promise<void> {
    rowsToAdd.map((rowData): void => {
      this.gridProvider.addData(rowData).then((response) =>
        this.gridApi.updateRowData({
          add: [response],
        }),
      );
    });
  }

  public async removeRows({ rowsToRemove }: RemoveQuery): Promise<void> {
    rowsToRemove.map((row): void => {
      this.gridProvider.removeData(row.id).then((response) =>
        this.gridApi.updateRowData({
          remove: [response],
        }),
      );
    });
  }

  public async updateRows({ rowsToUpdate }: UpdateQuery): Promise<void> {
    rowsToUpdate.map((rowData): void => {
      const node = this.gridApi.getRowNode(rowData.id);
      // Clone the old data so it doesn't get mutated by the api
      const oldData = { ...node.data };
      const combinedData = { ...oldData, ...rowData };

      node.setData(combinedData);
      this.gridProvider
        .updateData(rowData)
        .then((response) =>
          this.gridApi.updateRowData({
            update: [response],
          }),
        )
        .catch(() =>
          this.gridApi.updateRowData({
            update: [oldData],
          }),
        );
    });
  }
}
