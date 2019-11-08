import { VueEventParams, VueEvent } from '@/types/config';
import {
  RowDoubleClickedEvent,
  CellDoubleClickedEvent,
} from 'ag-grid-community';
import { RowDragMoveEvent, RowDragEndEvent } from 'ag-grid-community';

// export * from './hierarchyRearrange';

export type VueEventFunc<T> = (
  this: VueEventParams<T>,
  ...args: any[]
) => VueEvent<T>;

export type VueEventCall<T> = (params: VueEventParams<T>) => VueEvent<T>;

/**
 * Create a custom grid event where an optional conditional can be set when it
 * is called.
 */
export function createGridEvent<T>(func: VueEventFunc<T>) {
  return (
    conditional?: (this: VueEventParams<T>) => boolean,
    ...args: any[]
  ) => {
    const createItem: VueEventCall<T> = (params) => ({
      conditional:
        typeof conditional === 'function' ? conditional.apply(params) : false,
      ...func.apply(params, args),
    });
    return createItem;
  };
}

export const doubleClickView = createGridEvent<CellDoubleClickedEvent>(
  function() {
    return {
      type: 'cell-double-clicked',
      callback: () => {
        this.gridInstance.componentApi.viewRow(this.event.node);
      },
    };
  },
);

export const dragOver = createGridEvent<DragEvent>(function() {
  return {
    type: 'dragover',
    callback: () => {
      if (this.event.dataTransfer) {
        this.event.dataTransfer.dropEffect = 'move';
      }
      this.event.preventDefault();
    },
  };
});

export const rowDragLeft = createGridEvent<RowDragMoveEvent>(function() {
  return {
    type: 'rowDragLeave',
    callback: () => {
      this.vueStore.grid.setPotentialParent({
        parentNode: null,
        gridApi: this.event.api,
      });
    },
  };
});

export const rowDragEnd = createGridEvent<RowDragEndEvent>(function() {
  return {
    type: 'rowDragEnd',
    callback: () => {
      if (this.event.node.allLeafChildren.includes(this.event.overNode)) {
        this.vueStore.grid.setPotentialParent({
          parentNode: null,
          gridApi: this.event.api,
        });
        return;
      }
      const rowToMove = this.event.node.data;
      // Graphene doesn't support null data type, therefore we map it to 0
      const newParentId = this.event.overNode ? this.event.overNode.data.id : 0;
      this.vueStore.grid.setPotentialParent({
        parentNode: null,
        gridApi: this.event.api,
      });
      if (newParentId === rowToMove.id) {
        return;
      }

      const newData = {
        id: rowToMove.id,
        parent: newParentId,
      };

      this.gridInstance.updateRows({
        rowsToUpdate: [newData],
      });
      this.gridInstance.gridApi.getRowNode(newParentId).setExpanded(true);
    },
  };
});

export const rowDragMoved = createGridEvent<RowDragMoveEvent>(function() {
  return {
    type: 'rowDragMove',
    callback: () => {
      if (this.event.node.allLeafChildren.includes(this.event.overNode)) {
        this.vueStore.grid.setPotentialParent({
          parentNode: null,
          gridApi: this.event.api,
        });
        return;
      }
      this.vueStore.grid.setPotentialParent({
        parentNode: this.event.overNode,
        gridApi: this.event.api,
      });
    },
  };
});
