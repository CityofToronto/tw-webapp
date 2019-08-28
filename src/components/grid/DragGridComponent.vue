<template>
  <div
    style="height:100%"
    @drop="onDrop"
    @dragover="onDragOver"
  >
    <ag-grid-vue
      style="width: 100%; height: 200px"
      class="ag-theme-material"
      :dom-layout="autoHeight ? 'autoHeight': 'normal'"
      :grid-options="gridOptions"
      :column-defs="columnDefs"
      :row-height="7 * 6"
      :header-height="7 * 7"
      :context="context"
      :animate-rows="true"
      @grid-ready="onGridReady"
    />
  </div>
</template>

<script lang="ts">
import { RowNode } from 'ag-grid-community';
import { Component, Mixins } from 'vue-property-decorator';

import GridMixin from '../ts/GridMixin';

@Component({})
export default class DragGridComponent extends Mixins(GridMixin) {
  activeIds: number[] = [];

  onDrop(event: DragEvent) {
    this.activeIds = this.gridApi.getRenderedNodes().map((node): number => node.data.id);
    if (event.dataTransfer) {
      const newData = JSON.parse(event.dataTransfer.getData('application/json'));
      console.log(this.activeIds, newData.id);
      if (!this.activeIds.includes(newData.id)) {
        this.gridInstance.addRows({
          rowsToAdd: [newData],
          successCallback: () => {
            this.gridApi.purgeServerSideCache();
            this.activeIds.push(newData.id);
          },
        });
      }
    }
  };

  onDragOver(event: DragEvent) {
    if (event.dataTransfer) {
      const dragSupported = event.dataTransfer.types.indexOf('application/json') >= 0;
      if (dragSupported) {
        // eslint-disable-next-line no-param-reassign
        event.dataTransfer.dropEffect = 'move';
        event.preventDefault();
      }
    }
  };

  removeEntry(rowNode: RowNode) {
    this.gridInstance.removeRows({
      rowsToRemove: [rowNode.data],
      successCallback: () => {
        this.gridApi.purgeServerSideCache();
        this.activeIds = this.activeIds.filter((id): boolean => id !== rowNode.data.id);
      },
    });
  };
};
</script>

<style lang="scss">

</style>
