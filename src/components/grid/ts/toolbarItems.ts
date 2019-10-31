import Store from '@/store/store';
import { FunctionProps } from '@/types/grid';

type ToolbarItemFunction = (
  conditional?: (params: ToolbarFunction) => boolean,
) => ToolbarItem;

export interface ToolbarItem {
  icon?: string;
  text: string | ((vueStore: Store) => string);
  tooltip: string;
  clickFunction: ToolbarFunction;
}

export interface ToolbarObject extends ToolbarItem {
  disabled: (params: FunctionProps) => boolean;
}

export type ToolbarFunction = ({
  gridInstance,
  vueStore,
}: FunctionProps) => void;

/**
 * Helper function that injects a disabled conditional
 */
const createToolbarItem = (item: ToolbarItem) => {
  return (
    disabled: (params: FunctionProps) => boolean = () => false,
  ): ToolbarObject => ({
    ...item,
    disabled,
  });
};

/**
 * Launches the add form popup window populated with
 * column defs where showInForm is true.
 */
export const addRow = createToolbarItem({
  icon: 'add_circle',
  text: 'Add',
  tooltip: 'Add a New Row to Grid',
  clickFunction: ({ gridInstance }: FunctionProps): void => {
    gridInstance.componentApi.addRow();
  },
});

/**
 * Either copies the single selected row, launching the add form window populated
 * with the selected row. Or, if multiple rows are selected, strips id and
 * passes to database to assign new ids.
 */
export const copyRow = createToolbarItem({
  icon: 'file_copy',
  text: 'Clone',
  tooltip: 'Clone Currently Selected Row(s)',
  clickFunction: ({ gridInstance }: FunctionProps): void => {
    gridInstance.componentApi.cloneRow();
  },
});

/**
 * Delete one or more selected rows. Will prompt user to confirm
 */
export const removeRow = createToolbarItem({
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
});

/**
 * Collapse all currently open nodes
 */
export const collapseAll = createToolbarItem({
  icon: 'expand_less',
  text: 'Collapse',
  tooltip: 'Close All Currently Open Groups',
  clickFunction: ({ gridInstance }: FunctionProps): void => {
    gridInstance.gridApi.forEachNode((node) => node.setExpanded(false));
  },
});

/**
 * Collapse all currently closed nodes
 */
export const expandAll = createToolbarItem({
  icon: 'expand_more',
  text: 'Expand',
  tooltip: 'Expand All Currently Closed Groups',
  clickFunction: ({ gridInstance }: FunctionProps): void => {
    gridInstance.gridApi.forEachNode((node) => node.setExpanded(true));
  },
});

/**
 * Fit all columns
 */
export const fitColumns = createToolbarItem({
  icon: 'tune',
  text: 'Fit',
  tooltip: 'Size All Columns To Fit Width of Grid',
  clickFunction: ({ gridInstance }: FunctionProps): void => {
    gridInstance.sizeColumnsToFit();
  },
});

/**
 * Size all columns
 */
export const sizeColumns = createToolbarItem({
  icon: 'sort',
  text: 'Size',
  tooltip: 'Size Columns to Fit Their Contents',
  clickFunction: ({ gridInstance }: FunctionProps): void => {
    gridInstance.autoSizeColumns();
  },
});

/**
 * Toggle the side panel
 */
export const togglePanel: ToolbarItem = {
  text: (vueStore: Store) =>
    vueStore.display.reviewPanelState ? 'Close Panel' : 'Expand Panel',
  tooltip: 'Toggle Side Panel',
  clickFunction: ({ vueStore }: FunctionProps) => {
    vueStore.display.toggleReviewPanel();
  },
};
