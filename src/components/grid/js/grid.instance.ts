import { GridApi, ColumnApi } from 'ag-grid-community';
import { add, update, deleteEntry } from '../apollo';
import { AddQuery } from '../apollo/types';

interface GridInst {
  gridApi: GridApi,
}

export default class GridInstance {
  private gridApi: GridApi;

  columnApi: ColumnApi;

  private tableName: string;

  constructor(_gridApi: GridApi, _columnApi: ColumnApi, _tableName: string) {
    this.gridApi = _gridApi;
    this.columnApi = _columnApi;
    this.tableName = _tableName;
  }

  purgeCache(): void {
    this.gridApi.purgeServerSideCache();
  }

  getSelectedRows() {
    return this.gridApi.getSelectedRows();
  }

  addRows({ rowData, callBack }:AddQuery) {
    add({
      tableName: this.tableName,
      rowData,
      callBack,
    });
  }

  removeRows() {
    const rows = this.getSelectedRows();
    if (rows.length === 0) {
      return;
    }
    rows.forEach(row => {
      deleteEntry({
        id: row.id,
        tableName: this.tableName,
      });
    });
    this.gridApi.deselectAll();
    this.gridApi.purgeServerSideCache();
  }

  updateRow({ rowNode, rowData, callBack }) {
    update({
      tableName: this.tableName,
      data: rowData,
      id: rowNode.data.id,
      callBack,
    });
    rowNode.setData(rowData);
  }

  cloneRows() {
    const rows = this.getSelectedRows();
    if (rows.length < 2 && rows.length > 0) {
    }
  }

  sizeColumnsToFit() {
    this.gridApi.sizeColumnsToFit();
  }

  autoSizeColumns() {
    const allColumnIds = this.columnApi.getAllColumns().map(col => col.colId);
    this.columnApi.autoSizeColumns(allColumnIds);
  }
}
