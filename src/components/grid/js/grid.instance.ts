import { GridApi, ColumnApi, RowNode } from 'ag-grid-community';
import {
  add, update, deleteEntry, getRelationships,
} from '../apollo';
import { AddQuery, UpdateQuery } from '../apollo/types';

interface GridInst {
  gridApi: GridApi,
}

export default class GridInstance {
  constructor(private gridApi: GridApi, private columnApi: ColumnApi, public tableName: string) {}

  purgeCache(): void {
    this.gridApi.purgeServerSideCache();
  }

  getSelectedRows() {
    return this.gridApi.getSelectedRows();
  }

  addRows({ tableName, newData, callBack }:AddQuery) {
    add({
      tableName,
      newData,
      callBack,
    });
  }

  get columnDefs() {
    return this.columnApi.getAllColumns().map(column => column.getColDef());
  }

  removeRows() {
    const callBack = () => {
      this.purgeCache();
      this.gridApi.deselectAll();
    };

    const rows = this.getSelectedRows();
    if (rows.length === 0) {
      return;
    }
    rows.forEach((row) => {
      deleteEntry({
        id: row.id,
        tableName: this.tableName,
        callBack,
        unsuccessfulCallBack: () => {},
      });
    });
    
  }

  updateRow(
    { rowNode, newData, callBack }:
    { rowNode: RowNode; newData: object; callBack(): void },
  ) {
    update({
      tableName: this.tableName,
      newData,
      id: rowNode.data.id,
      callBack,
      unsuccessfulCallBack: () => {},
    });
    rowNode.setData(newData);
  }

  sizeColumnsToFit() {
    this.gridApi.sizeColumnsToFit();
  }

  autoSizeColumns() {
    const allColumnIds = this.columnApi.getAllColumns().map(col => col.getColId());
    this.columnApi.autoSizeColumns(allColumnIds);
  }
}
