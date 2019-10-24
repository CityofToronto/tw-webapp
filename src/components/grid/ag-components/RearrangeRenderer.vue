<template>
  <div
    draggable="true"
    class="cell-container"
    @dragstart="onDragStart"
    @drop="onDrop"
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
import GridInstance from '../ts/GridInstance';
import { storeInstance } from '@/store';
import { MergeContext } from '@/types/grid';

/**
 * RearrangeRenderer
 *
 */
@Component({})
export default class RearrangeRenderer extends Vue {
  params!: MergeContext<ICellRendererParams>;

  // When drag is started, assign the row's data to the dataTransfer object
  onDragStart(event: DragEventInit) {
    const fieldName = this.params.colDef.field;
    if (event.dataTransfer && fieldName) {
      event.dataTransfer.setData(
        'text/plain',
        JSON.stringify({
          fieldName,
          ...this.params.node.data,
        }),
      );
      event.dataTransfer.dropEffect = 'move';
    }
  }

  // This updates the DOM to have it look movable
  onDragOver = (event: DragEvent) => {
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }

    event.preventDefault();
  };

  // This will update
  onDrop(event: DragEvent) {
    const fieldName = this.params.colDef.field || 'unknown';

    // If the field is not defined, end the event
    if (fieldName === 'unknown') {
      return;
    }

    // If the spot it is dragged onto is full, end the event
    if (this.params.node.data[fieldName]) {
      //TODO test what ag-grid gives me here
      return;
    }

    // null check
    if (event.dataTransfer) {
      // get data from event as { key: value }
      const { fieldName, ...draggedFromData } = JSON.parse(
        event.dataTransfer.getData('text/plain'),
      );

      // Get ID of row dropped on and combine with from the row it was dragged from
      const eventData = {
        id: this.params.data.id,
        asset_id: draggedFromData.id, //TODO make this configurable
      };

      // Update the cell that was dropped on with new value

      this.params.context.gridInstance.updateRows({
        rowsToUpdate: [eventData],
      });
    }
  }
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
