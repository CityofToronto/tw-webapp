import { GridConfiguration } from '@/types/config';
import { createGridEvent } from '@/components/grid/ts/gridEvents';
import {
  RowDragEndEvent,
  RowNode,
  RowDragLeaveEvent,
} from '@ag-grid-enterprise/all-modules';

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

// This mixin allows drag and drop between grids
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
            if (!dragInProgress) return;
            if (!getRowId(this.event.target as Element)) return;
            const event: RowDragEndEvent = {
              api: this.gridInstance.gridApi,
              columnApi: this.gridInstance.columnApi,
              type: 'rowDragEnd',
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
          type: 'dragover',
          callback: () => {
            if (!dragInProgress) return;
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
