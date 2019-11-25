import Store from '@/store/store';
import { FunctionProps } from '@/types/grid';

export interface ToolbarItem {
  icon?: string;
  text: string | ((vueStore: Store) => string);
  tooltip: string;
  clickFunction: () => void;
}

export interface ToolbarObject extends ToolbarItem {
  disabled: (params: FunctionProps) => boolean;
}

export type ToolbarFunc = (this: FunctionProps, ...args: any[]) => ToolbarItem;

export type ToolbarCall = (params: FunctionProps) => ToolbarItem;
/**
 * Helper function that injects a disabled conditional
 */

export function createToolbarItem<T extends ToolbarFunc>(func: T) {
  return (
    disabled?: (this: FunctionProps) => boolean,
    ...args: Parameters<T>
  ) => {
    const createItem: ToolbarCall = (params) => ({
      disabled: typeof disabled === 'function' ? disabled.apply(params) : false,
      ...func.apply(params, args),
    });
    return createItem;
  };
}

/**
 * Launches the add form modal window populated with
 * column defs where showInForm is true.
 */
export const addRow = createToolbarItem(function() {
  return {
    icon: 'add_circle',
    text: 'Add',
    tooltip: 'Add a New Row to Grid',
    clickFunction: () => {
      this.gridInstance.componentApi.addRow();
    },
  };
});

/**
 * Either copies the single selected row, launching the add form window populated
 * with the selected row. Or, if multiple rows are selected, strips id and
 * passes to database to assign new ids.
 */
export const copyRow = createToolbarItem(function() {
  return {
    icon: 'file_copy',
    text: 'Clone',
    tooltip: 'Clone Currently Selected Row(s)',
    clickFunction: (): void => {
      this.gridInstance.componentApi.cloneRow();
    },
  };
});

/**
 * Delete one or more selected rows. Will prompt user to confirm
 */
export const removeRow = createToolbarItem(function() {
  return {
    icon: 'remove_circle',
    text: 'Remove',
    tooltip: 'Remove Currently Selected Row(s)',
    clickFunction: (): void => {
      const rowsToRemove = this.gridInstance.gridApi.getSelectedRows();
      if (
        confirm(
          `Are you sure you want to delete ${
            rowsToRemove.length > 1 ? 'these rows' : 'this row'
          }?`,
        )
      ) {
        this.gridInstance.removeRows({
          rowsToRemove: rowsToRemove,
        });
      }
    },
  };
});

/**
 * Collapse all currently open nodes
 */
export const collapseAll = createToolbarItem(function() {
  return {
    icon: 'expand_less',
    text: 'Collapse',
    tooltip: 'Close All Currently Open Groups',
    clickFunction: (): void => {
      this.gridInstance.gridApi.forEachNode((node) => (node.expanded = false));
      this.gridInstance.gridApi.onGroupExpandedOrCollapsed();
    },
  };
});

/**
 * Collapse all currently closed nodes
 */
export const expandAll = createToolbarItem(function() {
  return {
    icon: 'expand_more',
    text: 'Expand',
    tooltip: 'Expand All Currently Closed Groups',
    clickFunction: (): void => {
      this.gridInstance.gridApi.forEachNode((node) => (node.expanded = true));
      this.gridInstance.gridApi.onGroupExpandedOrCollapsed();
    },
  };
});

/**
 * Fit all columns
 */
export const fitColumns = createToolbarItem(function() {
  return {
    icon: 'tune',
    text: 'Fit',
    tooltip: 'Size All Columns To Fit Width of Grid',
    clickFunction: (): void => {
      this.gridInstance.sizeColumnsToFit();
    },
  };
});

/**
 * Size all columns
 */
export const sizeColumns = createToolbarItem(function() {
  return {
    icon: 'sort',
    text: 'Size',
    tooltip: 'Size Columns to Fit Their Contents',
    clickFunction: (): void => {
      this.gridInstance.autoSizeColumns();
    },
  };
});

/**
 * Toggle the side panel
 */
export const togglePanel = createToolbarItem(function() {
  return {
    text: this.vueStore.display.reviewPanelState
      ? 'Close Panel'
      : 'Expand Panel',
    tooltip: 'Toggle Side Panel',
    clickFunction: () => {
      this.vueStore.display.toggleReviewPanel();
    },
  };
});
