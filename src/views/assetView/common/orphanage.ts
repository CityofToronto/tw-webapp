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

/**
 * This function adopts the selected children in the orphanage
 * This function works, I think, its a bit complex
 */
export const adoptBranch = createContextItem((params) => {
  const name = 'Adopt Selected Orphans';

  try {
    const orphanGrid = storeInstance.grid.getGridInstance(
      'orphan_view',
    ) as GridInstance;

    // Get all rowNodes that are selected
    const selectedRows = orphanGrid.getSelectedNodes();
    // Get selected rowNodes' ids
    const selectedIds = selectedRows.map((x) => x.id);

    // Get all the children of the selected nodes
    const allNodes = [
      ...new Set(
        selectedRows.map((node) => node.allLeafChildren).flat(Infinity),
      ),
    ];

    // Get all nodes that have a parent
    const childrenIds = orphanGrid
      .getSelectedNodes()
      .map((node) =>
        node.childrenMapped ? Object.values(node.childrenMapped) : undefined,
      )
      .flat(Infinity)
      .map((x) => x.id);

    // Parents are selected ids - children ids
    const parentIds = selectedIds.filter((x) => !childrenIds.includes(x));

    // Next we need to remove the parents and refigure out the hierarchy
    // Then do the same and get the parents as they bring their children along
    const orphanNodes = allNodes.filter((x) => !selectedRows.includes(x));

    const orphanChildren = orphanNodes
      .map((node) =>
        node.childrenMapped ? Object.values(node.childrenMapped) : undefined,
      )
      .flat(Infinity);

    // Again, parents to orphan is all leftover from adoption - children
    const orphanParents = orphanNodes
      .filter((x) => !orphanChildren.includes(x))
      .map((x) => x.id);

    return {
      name,
      action: () => {
        // First we set orphans to top level then adopt the parents (their children come with)
        orphanGrid
          .updateRows({
            rowsToUpdate: orphanParents.map((id) => ({ id, parent: 2 })),
            refresh: false,
          })
          .then(() =>
            orphanGrid.updateRows({
              rowsToUpdate: parentIds.map((id) => ({
                id,
                parent: params.node.id,
              })),
              refresh: false,
            }),
          )
          .then(() => params.context.vueStore.grid.forceUpdateAllGrids());
      },
      disabled: !selectedRows.length,
    };
  } catch {
    // If we error, return the item as disabled.
    return {
      name,
      action: () => {},
      disabled: true,
    };
  }
});
