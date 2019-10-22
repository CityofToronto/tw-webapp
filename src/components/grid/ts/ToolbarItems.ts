import Store from '@/store/store';
import { FunctionProps } from '@/types/grid';

export interface ToolbarItem {
  icon?: string;
  text: string | ((vueStore: Store) => string);
  tooltip: string;
  clickFunction: ToolbarFunction;
}

export type ToolbarFunction = ({
  gridInstance,
  vueStore,
}: FunctionProps) => void;

export const addRow: ToolbarItem = {
  icon: 'add_circle',
  text: 'Add',
  tooltip: 'Add a New Row to Grid',
  clickFunction: ({ gridInstance }: FunctionProps): void => {
    gridInstance.componentApi.addRow();
  },
};

export const copyRow: ToolbarItem = {
  icon: 'file_copy',
  text: 'Clone',
  tooltip: 'Clone Currently Selected Row(s)',
  clickFunction: ({ gridInstance }: FunctionProps): void => {
    gridInstance.componentApi.cloneRow();
  },
};

export const removeRow: ToolbarItem = {
  icon: 'remove_circle',
  text: 'Remove',
  tooltip: 'Remove Currently Selected Row(s)',
  clickFunction: ({ gridInstance }: FunctionProps): void => {
    const rowsToRemove = gridInstance.gridApi.getSelectedRows();
    if (
      confirm(
        `Are you sure you want to delete ${
          rowsToRemove.length > 1 ? 'these rows' : 'this row'
        }?`,
      )
    ) {
      gridInstance.removeRows({
        rowsToRemove: rowsToRemove,
      });
    }
  },
};

export const collapseAll: ToolbarItem = {
  icon: 'expand_less',
  text: 'Collapse',
  tooltip: 'Close All Currently Open Groups',
  clickFunction: ({ gridInstance }: FunctionProps): void => {
    gridInstance.gridApi.forEachNode((node) => node.setExpanded(false));
  },
};

export const expandAll: ToolbarItem = {
  icon: 'expand_more',
  text: 'Expand',
  tooltip: 'Expand All Currently Closed Groups',
  clickFunction: ({ gridInstance }: FunctionProps): void => {
    gridInstance.gridApi.forEachNode((node) => node.setExpanded(true));
  },
};

export const fitColumns: ToolbarItem = {
  icon: 'tune',
  text: 'Fit',
  tooltip: 'Size All Columns To Fit Width of Grid',
  clickFunction: ({ gridInstance }: FunctionProps): void => {
    gridInstance.sizeColumnsToFit();
  },
};

export const sizeColumns: ToolbarItem = {
  icon: 'sort',
  text: 'Size',
  tooltip: 'Size Columns to Fit Their Contents',
  clickFunction: ({ gridInstance }: FunctionProps): void => {
    gridInstance.autoSizeColumns();
  },
};

export const togglePanel: ToolbarItem = {
  text: (vueStore: Store) =>
    vueStore.display.reviewPanelState ? 'Close Panel' : 'Expand Panel',
  tooltip: 'Toggle Side Panel',
  clickFunction: ({ vueStore }: FunctionProps) => {
    vueStore.display.toggleReviewPanel();
  },
};
