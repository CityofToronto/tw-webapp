import Store from '@/store/store';
import { storeInstance } from '@/store';
import GridInstance from './GridInstance';
import { GridApi, ColumnApi, RowNode } from 'ag-grid-community';
import { FormData } from '@/types/grid';
import { BaseColumnParams } from '@/types/config';

const twoConditionReturn = (
  cond1: boolean | undefined,
  cond2: boolean | undefined,
): boolean => {
  if (!!cond1 && !!cond2) {
    return cond1 || cond2;
  } else if (!!cond1 || !!cond2) {
    if (cond1) {
      return cond1;
    } else if (cond2) {
      return cond2;
    }
  }
  return false;
};

export default class ComponentApi {
  private gridInstance: GridInstance;

  private gridApi: GridApi;

  private columnApi: ColumnApi;

  store: Store = storeInstance;

  constructor(gridInstance: GridInstance) {
    this.gridInstance = gridInstance;
    this.gridApi = gridInstance.gridApi;
    this.columnApi = gridInstance.columnApi;
  }

  /**
   * Launches form and sets the callback function for the save button.
   *
   * Used by editRow, addRow and cloneRow methods
   */
  private launchForm({
    confirmCallback,
    data,
    popupTitle,
  }: {
    confirmCallback: (...args: any[]) => void;
    data: FormData;
    popupTitle: string;
    columnDefs?: BaseColumnParams[];
  }) {
    this.store.popup.setPopup({
      popupTitle,
      componentType: 'form',
      columnDefs: this.gridInstance.columnDefs as BaseColumnParams[],
      formData: data,
      confirmCallback,
    });
  }

  /**
   * Edit a row node with a visual editor
   */
  editRow(rowNode: RowNode) {
    const confirmCallback = (formData: FormData) => {
      this.gridInstance
        .addRows({
          rowsToAdd: [formData],
        })
        .then(() => this.store.popup.closePopup());
    };

    this.launchForm({
      confirmCallback,
      data: rowNode.data,
      popupTitle: `Edit ${this.gridInstance.gridTitle}`,
    });
  }

  /**
   * Add a row node with a visual editor
   */
  addRow(data?: { [p: string]: any }) {
    const confirmCallback = (formData: FormData) => {
      this.gridInstance
        .addRows({
          rowsToAdd: [formData],
        })
        .then(() => this.store.popup.closePopup());
    };

    this.launchForm({
      confirmCallback,
      data: data || {},
      popupTitle: `Add ${this.gridInstance.gridTitle}`,
    });
  }

  /**
   * Add a child to a row node with a visual editor
   */
  addChildToRow(rowNode: RowNode & { data: { parent: number } }) {
    this.addRow({
      parent: rowNode.data.id,
    });
  }

  /**
   * Clone the currently selected rows.
   *
   * It strips the ID for the database to generate a new one.
   */
  cloneRow() {
    const rowsToClone = this.gridApi.getSelectedRows();

    if (rowsToClone.length === 1) {
      const [{ id, ...omittedId }] = rowsToClone;
      this.addRow(omittedId);
    } else if (rowsToClone.length > 1) {
      const removedIds = rowsToClone.map((row) => {
        const { id, ...omittedId } = row;
        return omittedId;
      });
      this.gridInstance.addRows({
        rowsToAdd: removedIds,
      });
    }
  }

  /**
   * View the row with none of the fields editable
   */
  viewRow(rowNode: RowNode) {
    // const data

    const columnDefs = this.gridInstance.columnDefs.map((colDef) => ({
      ...colDef,
      readonly: true,
      showInForm: twoConditionReturn(colDef.showInForm, colDef.showInView),
    })) as BaseColumnParams[];

    this.store.popup.setPopup({
      componentType: 'form',
      columnDefs,
      formData: rowNode.data,
      confirmCallback: () => this.store.popup.closePopup(),
      popupTitle: 'Viewing Entry',
      cancelButtonText: false,
    });
  }
}
