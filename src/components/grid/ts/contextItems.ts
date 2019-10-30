import { MenuItemDef, GetContextMenuItemsParams } from 'ag-grid-community';
import { MergeContext } from '@/types/grid';

export type ContextMenuParams = MergeContext<GetContextMenuItemsParams>;

export interface MenuItemObject
  extends Omit<MenuItemDef, 'action' | 'name' | 'disabled'> {
  /**
   * Provide either a string or callback to string
   */
  name: string | ((params: ContextMenuParams) => string);
  /**
   * Provide the action to execute on click
   */
  action: (params: ContextMenuParams) => void;
}

export interface MenuItem extends MenuItemObject {
  disabled: (params: ContextMenuParams) => boolean;
}

type MenuItemDefFunction = (
  disabled?: (params: ContextMenuParams) => boolean,
) => MenuItem;

/**
 * Create a context menu item that a conditional can be passed through
 */
export const createContextItem = (
  menuItem: MenuItemObject,
): MenuItemDefFunction => {
  return (disabled: (params: ContextMenuParams) => boolean = () => false) => ({
    ...menuItem,
    disabled,
  });
};

/**
 * Context menu that selects all children
 */
export const selectAllChildren = createContextItem({
  name: 'Select All Children',
  action: (params) =>
    params.node.allLeafChildren.forEach((rowNode) => rowNode.setSelected(true)),
});

export const orphanBranch = createContextItem({
  name: ({ context }) =>
    context.vueStore.grid.orphanStatus ? 'Adopt Orphan' : 'Orphan Branch',
  action: async (params) => {
    const { vueStore, gridInstance } = params.context;

    if (!vueStore.grid.orphanStatus) {
      // Orphan a branch
      await gridInstance.updateRows({
        rowsToUpdate: [
          {
            id: params.node.data.id,
            parent: 2,
          },
        ],
        refresh: false,
      });
    } else {
      // Adopt the orphans
      // Get latest version of orphans
      const rowsToUpdate = vueStore.grid.orphan.map((id) => ({
        id,
        parent: params.node.id,
      }));
      await gridInstance.updateRows({
        rowsToUpdate,
        refresh: false,
      });
    }
    vueStore.grid.forceUpdateAllGrids();
  },
});
