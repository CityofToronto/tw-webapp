import { RowDragMoveEvent, RowDragEndEvent } from 'ag-grid-community';
import { createGridEvent } from '.';

export const rowDragLeft = createGridEvent<RowDragMoveEvent>({
  type: 'rowDragLeave',
  callback: ({ event, vueStore }) => {
    vueStore.grid.setPotentialParent({
      parentNode: null,
      gridApi: event.api,
    });
  },
});

export const rowDragEnd = createGridEvent<RowDragEndEvent>({
  type: 'rowDragEnd',
  callback: ({ event, gridInstance, vueStore }) => {
    const rowToMove = event.node.data;
    // Graphene doesn't support null data type, therefore we map it to 0
    const newParentId = event.overNode ? event.overNode.data.id : 0;
    vueStore.grid.setPotentialParent({
      parentNode: null,
      gridApi: event.api,
    });
    if (newParentId === rowToMove.id) {
      return;
    }

    const newData = {
      id: rowToMove.id,
      parent: newParentId,
    };

    gridInstance.updateRows({
      rowsToUpdate: [newData],
    });
    gridInstance.gridApi.getRowNode(newParentId).setExpanded(true);
  },
});

export const rowDragMoved = createGridEvent<RowDragMoveEvent>({
  type: 'rowDragMove',
  callback({ event, vueStore }) {
    vueStore.grid.setPotentialParent({
      parentNode: event.overNode,
      gridApi: event.api,
    });
  },
});
