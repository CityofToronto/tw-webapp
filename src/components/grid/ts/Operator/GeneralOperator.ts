import Store from '@/store/store';
import { storeInstance } from '@/store';
import GridInstance from '../GridInstance';
import { GridApi, ColumnApi, RowNode } from 'ag-grid-community';
import { ViewportRowModel } from 'ag-grid-enterprise';

export default class GeneralOperator {
  gridInstance: GridInstance;

  gridApi: GridApi;

  columnApi: ColumnApi;

  store: Store = storeInstance;

  constructor(gridInstance: GridInstance) {
    this.gridInstance = gridInstance;
    this.gridApi = gridInstance.gridApi;
    this.columnApi = gridInstance.columnApi;
  }

  launchForm({
    confirmCallback,
    data,
    formTitle,
  }: {
    confirmCallback: () => void;
    data: FormData;
    formTitle: string;
  }) {
    this.store.popup.setPopup({
      formTitle,
      componentType: 'form',
      columnDefs: this.gridInstance.columnDefs,
      formData: data,
      confirmCallback,
    });
  }

  editRow(rowNode: RowNode) {
    const confirmCallback = (formData: FormData) => {
      this.gridInstance.addRows().then(() => this.store.popup.closePopup());
    };
  }
}
