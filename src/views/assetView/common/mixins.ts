import { GridConfiguration } from '@/types/config';
import { createGridEvent } from '@/components/grid/ts/gridEvents';
import { RowDragEndEvent, RowNode } from '@ag-grid-enterprise/all-modules';

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
  return getRowId(element.parentElement as Element);
};

export const dragOutside: GridConfiguration = {
  gridEvents: (() => {
    let node: RowNode;
    let overNode: RowNode;

    return [
      createGridEvent<DragEvent>(function() {
        return {
          type: 'dragstart',
          callback: () => {
            if (this.event.dataTransfer) {
              const eventData = JSON.parse(
                this.event.dataTransfer.getData('application/json'),
              );
              node = this.gridInstance.gridApi.getRowNode(eventData.id);
              console.log(node);
            }
          },
        };
      })(),
      createGridEvent<DragEvent>(function() {
        return {
          type: 'drop',
          callback: () => {
            console.log(node, overNode);
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
            this.event.preventDefault();
            if (this.event.dataTransfer) {
              this.event.dataTransfer.dropEffect = 'move';
            }
            overNode = this.gridInstance.gridApi.getRowNode(
              getRowId(this.event.target as Element),
            );
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
    ];
  })(),
};
