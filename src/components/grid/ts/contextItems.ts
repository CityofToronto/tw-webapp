import { MenuItemDef, GetContextMenuItemsParams } from 'ag-grid-community';
import GridInstance from './GridInstance';
import Store from '@/store/store';
import { MergeContext } from '@/types/grid';
import { storeInstance } from '@/store';

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
    if (!vueStore.grid.orphan) {
      gridInstance
        .updateRows({
          rowsToUpdate: [
            {
              id: params.node.data.id,
              parent: '2',
            },
          ],
        })
        .then(() => {
          vueStore.grid.forceUpdateAllGrids();
          vueStore.grid.setOrphanID(params.node.id);
        });
    } else {
      gridInstance
        .updateRows({
          rowsToUpdate: [
            {
              id: vueStore.grid.orphan,
              parent: params.node.id,
            },
          ],
        })
        .then(() => {
          vueStore.grid.setOrphanID('');
          vueStore.grid.forceUpdateAllGrids();
        });
    }
  },
};
