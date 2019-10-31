import {
  ContextMenuFunc,
  createContextItem,
} from '@/components/grid/ts/contextItems';
import GridInstance from '@/components/grid/ts/GridInstance';
import { storeInstance } from '@/store';

export const orphanBranch = createContextItem((params) => {
  return {
    name: 'Orphan Branch',
    action: async () => {
      const { vueStore, gridInstance } = params.context;

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

      vueStore.grid.forceUpdateAllGrids();
    },
  };
});

export const adoptBranch = createContextItem((params) => {
  const name = 'Adopt Selected Orphans';

  try {
    const orphanGrid = storeInstance.grid.getGridInstance(
      'orphan_view',
    ) as GridInstance;

    const selectedOrphans = orphanGrid.getSelectedRows();

    return {
      name,
      action: () => {
        const gridInstance = params.context.gridInstance;
        const orphanTransaction = selectedOrphans.map((row) => ({
          id: row.id,
          parent: params.node.data.id,
        }));

        gridInstance
          .updateRows({
            rowsToUpdate: orphanTransaction,
          })
          .then(() => storeInstance.grid.forceUpdateAllGrids());
      },
      disabled: !selectedOrphans.length,
    };
  } catch (error) {
    // If we error, return the item as disabled.
    return {
      name,
      action: () => {},
      disabled: true,
    };
  }
});
