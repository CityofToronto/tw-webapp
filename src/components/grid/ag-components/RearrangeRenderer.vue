<template>
  <div
    draggable="true"
    class="cell-container"
    @dragstart="onDragStart"
    @drop="onDrop"
    @dragleave="onDragLeave"
    @dragover="onDragOver"
  >
    <span style="flex-shrink: 1">
      <v-icon>drag_indicator</v-icon>
    </span>
    <span style="flex-grow: 1">
      {{ params.value }}
    </span>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { ICellRendererParams } from 'ag-grid-community';

@Component({})
export default class RearrangeRenderer extends Vue {
  params!: ICellRendererParams;

  onDragStart(event: DragEventInit) {
    if (event.dataTransfer) {
      event.dataTransfer.setData(
        'text/plain',
        JSON.stringify(this.params.node.data),
      );
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDragOver = (event: DragEvent) => {
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }

    event.preventDefault();
  };

  onDrop(event: DragEvent) {
    if (event.dataTransfer) {
      const eventData = JSON.parse(event.dataTransfer.getData('text/plain'));
      const fieldName = this.params.colDef.field || 'unknown';

      // Set this to the cell dropped on
      const newData = {
        ...this.params.node.data,
        [fieldName]: eventData[fieldName],
      };

      // Set this to the cell that was dragged from
      const oldData = {
        ...eventData,
        [fieldName]: this.params.data['asset'],
      };

      // Update the cell that was dropped on
      this.params.context.componentParent.updateCellValue(
        this.params.node,
        'asset',
        newData,
        this.params.node.data['asset'],
      );
      // Update the cell that was dragged from
      this.params.context.componentParent.updateCellValue(
        this.params.api.getRowNode(`${eventData.id}`),
        'asset',
        oldData,
        eventData['asset'],
      );
    }
  }

  onDragLeave() {}
}
</script>

<style scoped>
.cell-container {
  display: flex;
}
.v-icon {
  font-size: 18px !important;
  color: #bdbdbd !important;
}

.v-icon:hover {
  color: #616161 !important;
}
</style>
