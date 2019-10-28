import { VueEvent } from '@/types/config';
import {
  RowDragMoveEvent,
  CellValueChangedEvent,
  RowDragEndEvent,
  RowDoubleClickedEvent,
} from 'ag-grid-community';

export const cellValueChanged: VueEvent<CellValueChangedEvent> = {
  type: '',
  callback: () => {},
};

export const rowDragMoved: VueEvent<RowDragMoveEvent> = {
  type: 'rowDragMove',
  callback: ({ event, vueStore }) => {
    vueStore.grid.setPotentialParent({
      parentNode: event.overNode,
      gridApi: event.api,
    });
  },
};

export const rowDragLeft: VueEvent<RowDragMoveEvent> = {
  type: 'rowDragLeave',
  callback: ({ event, vueStore }) => {
    vueStore.grid.setPotentialParent({
      parentNode: null,
      gridApi: event.api,
    });
  },
};

export const dragOver: VueEvent<DragEvent> = {
  type: 'dragover',
  callback: ({ event }) => {
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    event.preventDefault();
  },
};

export const rowDragEnd: VueEvent<RowDragEndEvent> = {
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
};

export const onDropAsset: VueEvent<DragEvent> = {
  type: 'drop',
  callback: ({ event, gridInstance, vueStore }) => {
    if (event.dataTransfer) {
      const eventData = JSON.parse(event.dataTransfer.getData('text/plain'));
      if (!eventData.asset_id) return;
      const rowData = {
        id: eventData.asset_id,
        role_id: 0,
      };

      gridInstance
        .updateRows({
          rowsToUpdate: [rowData],
        })
        .then(() => vueStore.grid.forceUpdateAllGrids());
    }
  },
};

export const doubleClickView: VueEvent<RowDoubleClickedEvent> = {
  type: 'row-double-clicked',
  callback: ({ event, gridInstance }) =>
    gridInstance.componentApi.viewRow(event.node),
};
