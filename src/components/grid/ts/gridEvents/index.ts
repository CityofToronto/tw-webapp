import { VueEventParams, VueEvent } from '@/types/config';
import {
  CellDoubleClickedEvent,
  RowDragEndEvent,
} from '@ag-grid-enterprise/all-modules';

import { getColumGroupName } from '@/common/utils';

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
        if (this.event.event?.type === 'click') return; // bug in ag grid where a dblClick is sent twice
        this.gridInstance.componentApi.viewRow(
          this.event.node,
          getColumGroupName(this.event.column),
        );
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

      const oldPathArray = (this.event.node.data.full_path as string).split(
        '.',
      );
      // Remove last element
      oldPathArray.pop();
      const oldPath = oldPathArray.join('.');

      const childrenData = this.event.node.allLeafChildren.map((node) => {
        const oldNodePath: string = node.data.full_path;

        return {
          ...node.data,
          full_path:
            this.event.overNode.data.full_path +
            oldNodePath.replace(oldPath, ''),
        };
      });

      const openRows = this.event.node.allLeafChildren.filter(
        (node) => node.expanded,
      );
      // Optimistically update the branch
      if (this.gridInstance.gridApi.getRowNode(this.event.node.id)) {
        this.gridInstance.gridApi.updateRowData({
          update: childrenData,
        });
      }
      // if row node is part of another grid, then we wait on subscriptions

      // If the branch fails, revert to previous state
      this.gridInstance
        .updateRows({
          rowsToUpdate: [newData],
          refresh: false,
        })
        .catch(() =>
          this.gridInstance.gridApi.updateRowData({
            update: this.event.node.allLeafChildren.map((node) => node.data),
          }),
        );

      // Open any previously open children and the new parent
      this.event.overNode.setExpanded(true);
      openRows.forEach((node) =>
        this.gridInstance.gridApi.getRowNode(node.id).setExpanded(true),
      );
    },
  };
});
