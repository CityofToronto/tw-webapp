import Store from '@/store/store';
import { storeInstance } from '@/store';
import GridInstance from './GridInstance';
import { GridApi, ColumnApi, RowNode } from 'ag-grid-community';
import { FormData } from '@/types/grid';
import { CellParams } from '@/types/config';
import { columnDefsToFormSchema } from './formAdapter';
import { getColumGroupName } from '@/common/utils';

/**
 * This function
 */
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

type LaunchFormFunction = (args: {
  confirmCallback: (...args: any[]) => void;
  data: FormData;
  title: string;
  columnDefs?: CellParams[];
}) => void;

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
  private launchForm: LaunchFormFunction = ({
    confirmCallback,
    data,
    title,
  }) => {
    this.store.modal.createFormModal({
      title,
      formSchema: columnDefsToFormSchema(
        this.gridInstance.columnDefs as CellParams[],
      ),
      formData: data,
      confirmCallback,
    });
  };

  /**
   * Edit a row node with a visual editor
   */
  editRow(rowNode: RowNode) {
    const formId = this.store.modal.generateId();
    const confirmCallback = (formData: FormData) => {
      this.gridInstance
        .addRows({
          rowsToAdd: [formData],
        })
        .then(() => this.store.modal.closeModal(formId));
    };

    this.launchForm({
      confirmCallback,
      data: rowNode.data,
      title: `Edit ${this.gridInstance.gridTitle}`,
    });
  }

  /**
   * Add a row node with a visual editor
   */
  addRow(data?: { [p: string]: any }) {
    const formId = this.store.modal.generateId();
    const confirmCallback = (formData: FormData) => {
      console.log(formData);
      this.gridInstance
        .addRows({
          rowsToAdd: [formData],
        })
        .then(() => this.store.modal.closeModal(formId));
    };

    this.launchForm({
      confirmCallback,
      data: data || {},
      title: `Add ${this.gridInstance.gridTitle}`,
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
  viewRow(rowNode: RowNode, group?: string) {
    // const data

    const columnDefs = this.columnApi
      .getAllColumns()
      .filter((col) => (group ? getColumGroupName(col) === group : true))
      .map((col) => col.getColDef()) as CellParams[];

    this.store.modal.createFormModal({
      formSchema: columnDefsToFormSchema(columnDefs),
      formData: rowNode.data,
      confirmCallback: () => {},
      title: 'Viewing Entry',
      cancelButtonText: false,
    });
  }
}
