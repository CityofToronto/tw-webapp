import { GridConfiguration } from '@/types/config';
import { createGridEvent } from '@/components/grid/ts/gridEvents';
import {
  RowDragEndEvent,
  RowNode,
  RowDragLeaveEvent,
  RowDragMoveEvent,
  GridApi,
} from '@ag-grid-enterprise/all-modules';

/**
 * Expand And Fit Mixin
 *
 * Adds the functionality where the grid expands the highest level of tree
 * and also fits the columns to the size of the grid
 */
export const expandAndFit: GridConfiguration = {
  gridInitializedEvent: ({ gridInstance }) => {
    gridInstance.gridApi.sizeColumnsToFit();
    gridInstance.gridApi
      .getRenderedNodes()
      .forEach((node) => node.setExpanded(true));
  },
};

const getRowId = (element: Element) => {
  if (element.hasAttribute('row-id')) {
    return element.getAttribute('row-id');
  }
  if (element.parentElement) {
    return getRowId(element.parentElement as Element);
  }
  return undefined;
};

const isRowDrag = (event: DragEvent) => {
  if (event.dataTransfer) {
    const eventJSON = event.dataTransfer.getData('application/json');
    if (eventJSON) {
      const eventData = JSON.parse(eventJSON);
      return eventData.dragType !== 'cell';
    }
  }
  return false;
};

/**
 * Drag Outside Mixin
 *
 * Allows for the grid it is applied to have its rows dragged outside the grid
 * are and dropped onto an accepting grid. The accepting grid must also be using this mixin
 */
export const dragOutside: GridConfiguration = {
  gridEvents: (() => {
    let node: RowNode;
    let overNode: RowNode;
    let dragInGrid = true;
    let dragInProgress = false;

    return [
      createGridEvent<DragEvent>(function() {
        return {
          type: 'dragstart',
          callback: () => {
            dragInProgress = isRowDrag(this.event);
            if (this.event.dataTransfer) {
              const eventData = JSON.parse(
                this.event.dataTransfer.getData('application/json'),
              );
              node = this.gridInstance.gridApi.getRowNode(eventData.id);
            }
          },
        };
      })(),
      createGridEvent<DragEvent>(function() {
        return {
          type: 'drop',
          callback: () => {
            const eventJSON = this.event.dataTransfer?.getData(
              'application/json',
            );
            if (eventJSON) {
              const eventData = JSON.parse(eventJSON);
              if (eventData?.dragType === 'cell') return;
            }

            const event: RowDragEndEvent = {
              api: this.gridInstance.gridApi,
              columnApi: this.gridInstance.columnApi,
              type: 'rowDragEnd',
              node,
              overNode,
              overIndex: overNode?.rowIndex,
              event: this.event,
              y: this.event.y,
              vDirection: 'Up',
            };
            this.gridInstance.gridApi.dispatchEvent(event);
          },
        };
      })(),
      createGridEvent<DragEvent>(function() {
        return {
          type: 'dragover',
          callback: () => {
            if (!dragInProgress) return;
            this.event.preventDefault();
            if (this.event.dataTransfer) {
              this.event.dataTransfer.dropEffect = 'move';
            }
            overNode = this.gridInstance.gridApi.getRowNode(
              getRowId(this.event.target as Element),
            );
            // If the over node is undefined, return
            if (!overNode) return;
            const event: RowDragEndEvent = {
              api: this.gridInstance.gridApi,
              columnApi: this.gridInstance.columnApi,
              type: 'rowDragMove',
              node,
              overNode,
              overIndex: overNode.rowIndex,
              event: this.event,
              y: this.event.y,
              vDirection: 'Up',
            };
            this.gridInstance.gridApi.dispatchEvent(event);
          },
        };
      })(),
      createGridEvent<DragEvent>(function() {
        return {
          type: 'dragenter',
          callback: () => {
            if (!dragInProgress) return;
            this.event.preventDefault();
            dragInGrid = !!getRowId(this.event.target as Element);
            setTimeout(() => {
              dragInGrid = false;
            }, 5);
          },
        };
      })(),
      createGridEvent<DragEvent>(function() {
        return {
          type: 'dragleave',
          callback: () => {
            if (!dragInProgress) return;
            this.event.preventDefault();
            if (!dragInGrid) {
              const event: RowDragLeaveEvent = {
                api: this.gridInstance.gridApi,
                columnApi: this.gridInstance.columnApi,
                type: 'rowDragLeave',
                node,
                overNode,
                overIndex: overNode?.rowIndex,
                event: this.event,
                y: this.event.y,
                vDirection: 'Up',
              };
              this.gridInstance.gridApi.dispatchEvent(event);
            }
          },
        };
      })(),
      createGridEvent<DragEvent>(function() {
        return {
          type: 'dragend',
          callback: () => {
            dragInProgress = false;
          },
        };
      })(),
    ];
  })(),
};

export const parentState: {
  potentialParent: RowNode | null;
  setPotentialParent(parentNode: RowNode | null, gridApi: GridApi): void;
} = {
  potentialParent: null,
  setPotentialParent(parentNode, gridApi) {
    const rowsToRefresh: RowNode[] = [];

    let newPotentialParent: RowNode | null;

    if (parentNode) {
      newPotentialParent = parentNode;
    } else {
      newPotentialParent = null;
    }

    if (this.potentialParent === newPotentialParent) {
      return;
    }

    if (this.potentialParent) {
      rowsToRefresh.push(this.potentialParent);
    }
    if (newPotentialParent) {
      rowsToRefresh.push(newPotentialParent);
    }

    this.potentialParent = newPotentialParent;
    gridApi.refreshCells({
      rowNodes: rowsToRefresh,
      force: true,
    });
  },
};

/**
 * @param parentToSet - The ID to set as parent if dropped not on a row
 */
export const rearrangeMixin = (parentToSet: number) => ({
  gridEvents: [
    createGridEvent<RowDragMoveEvent>(function() {
      return {
        type: 'rowDragLeave',
        callback: () => parentState.setPotentialParent(null, this.event.api),
      };
    })(),
    createGridEvent<RowDragMoveEvent>(function() {
      return {
        type: 'rowDragMove',
        callback: () => {
          // Can't set a row to its children or direct parent
          if (
            this.event.node.allLeafChildren.includes(this.event.overNode) ||
            this.event.node.parent === this.event.overNode
          ) {
            parentState.setPotentialParent(null, this.event.api);
            return;
          }
          parentState.setPotentialParent(this.event.overNode, this.event.api);
        },
      };
    })(),
    createGridEvent<RowDragMoveEvent>(function() {
      return {
        type: 'rowDragLeave',
        callback: () => parentState.setPotentialParent(null, this.event.api),
      };
    })(),
    createGridEvent<RowDragEndEvent>(function() {
      return {
        type: 'rowDragEnd',
        callback: () => {
          // Prevents from rearranging onto itself or its children
          if (
            this.event?.node?.allLeafChildren.includes(this.event.overNode) ||
            this.event.node.parent === this.event.overNode
          ) {
            parentState.setPotentialParent(null, this.event.api);
            return;
          }

          // Reset the parent state
          parentState.setPotentialParent(null, this.event.api);

          const rowToMove = this.event.node.data.id;
          const newParent = this.event?.overNode?.data?.id ?? parentToSet;

          this.gridInstance
            .updateRows({
              rowsToUpdate: [
                {
                  id: rowToMove,
                  parent: newParent,
                },
              ],
              refresh: false,
            })
            .then(() => this.vueStore.grid.forceUpdateAllGrids());
        },
      };
    })(),
  ],
});
