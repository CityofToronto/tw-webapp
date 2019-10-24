import { MenuItemDef, GetContextMenuItemsParams } from 'ag-grid-community';
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
    if (!vueStore.grid.orphanStatus) {
      // Orphan a branch
      gridInstance
        .updateRows({
          rowsToUpdate: [
            {
              id: params.node.data.id,
              parent: 2,
            },
          ],
        })
        .then(() => {
          vueStore.grid.forceUpdateAllGrids();
          vueStore.grid.fetchOrphanID();
        });
    } else {
      // Adopt the orphans
      // Get latest version of orphans
      await vueStore.grid.fetchOrphanID();
      const rowsToUpdate = vueStore.grid.orphan.map((id) => ({
        id,
        parent: params.node.id,
      }));
      gridInstance
        .updateRows({
          rowsToUpdate,
        })
        .then(() => {
          vueStore.grid.fetchOrphanID();
          vueStore.grid.forceUpdateAllGrids();
        });
    }
  },
};
