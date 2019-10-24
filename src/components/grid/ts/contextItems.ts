import {
  MenuItemDef,
  GetContextMenuItemsParams,
  Context,
} from 'ag-grid-community';
import { MergeContext } from '@/types/grid';

export type ContextMenuParams = MergeContext<GetContextMenuItemsParams>;

export interface ExtendedMenuItem extends Omit<MenuItemDef, 'action' | 'name'> {
  name: string | ((params: ContextMenuParams) => string);
  action: (params: ContextMenuParams) => void;
}

export const selectAllChildren: ExtendedMenuItem = {
  name: 'Select All Children',
  action: (params) =>
    params.node.allLeafChildren.forEach((rowNode) => rowNode.setSelected(true)),
};

export const orphanBranch: ExtendedMenuItem = {
  name: ({ context }) =>
    context.vueStore.grid.orphanStatus ? 'Adopt Orphan' : 'Orphan Branch',
  action: async (params) => {
    const { vueStore, gridInstance } = params.context;
    await vueStore.grid.fetchOrphanID();

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
      gridInstance.gridApi.updateRowData({
        remove: [{ id: params.node.data.id }],
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
    vueStore.grid.fetchOrphanID();
  },
};
