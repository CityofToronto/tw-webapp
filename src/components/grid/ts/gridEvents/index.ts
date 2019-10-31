import { VueEventParams, VueEvent } from '@/types/config';
import { RowDoubleClickedEvent } from 'ag-grid-community';
import { RowDragMoveEvent, RowDragEndEvent } from 'ag-grid-community';

// export * from './hierarchyRearrange';

export interface EventParams<T> {
  conditional?: (eventParams: VueEventParams<T>) => boolean;
}

/**
 * Create a custom grid event where an optional conditional can be set when it
 * is called.
 */
export const createGridEvent = <T>(event: VueEvent<T>) => {
  return (params: EventParams<T> = { conditional: () => true }) => ({
    ...event,
    conditional: params.conditional,
  });
};

export const doubleClickView = createGridEvent<RowDoubleClickedEvent>({
  type: 'row-double-clicked',
  callback: ({ event, gridInstance }) =>
    gridInstance.componentApi.viewRow(event.node),
});

export const dragOver = createGridEvent<DragEvent>({
  type: 'dragover',
  callback: ({ event }) => {
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    event.preventDefault();
  },
});

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
