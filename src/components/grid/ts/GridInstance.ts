import { RowData, AddQuery, RemoveQuery, UpdateQuery } from '@/types/grid';
import {
  ColumnApi,
  GridApi,
  GridOptions,
  RowNode,
} from '@ag-grid-enterprise/all-modules';
import BaseGridProvider from './GridProviders/BaseGridProvider';
import ComponentApi from './componentApi';
import { CellParams } from '@/types/config';

export default class GridInstance {
  public gridApi: GridApi;

  public columnApi: ColumnApi;

  public gridProvider: BaseGridProvider;

  public gridOptions: GridOptions;

  public componentApi: ComponentApi;

  public gridTitle = '';

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

  public forceUpdateData() {
    this.gridProvider
      .getData()
      .then((response) => this.gridApi.setRowData(response));
  }

  public subscribeToMore() {
    return this.gridProvider.subscribeToData(this);
  }

  public get columnDefs(): CellParams[] {
    return this.columnApi
      .getAllColumns()
      .map((column) => column.getColDef() as CellParams);
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

  public getSelectedNodes(): RowNode[] {
    return this.gridApi.getSelectedNodes();
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

  public async updateRows({
    rowsToUpdate,
    refresh = true,
  }: UpdateQuery): Promise<void> {
    rowsToUpdate.map((rowData): void => {
      // TODO Bug fix this
      this.gridProvider.updateData(rowData).then((response) => {
        if (refresh) {
          this.gridApi.updateRowData({
            update: [response],
          });
          this.gridApi.refreshCells({
            force: true,
            rowNodes: [this.gridApi.getRowNode(rowData.id)],
          });
        }
      });
    });
  }
}
