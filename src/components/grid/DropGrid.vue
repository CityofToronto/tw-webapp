/* eslint-disable vue/valid-v-on */
<template>
  <div style="height:100%" @drop="onDrop" @dragover="onDragOver">
    <ag-grid-vue
      style="width: 100%; height: 100%"
      class="ag-theme-material"
      :dom-layout="autoHeight ? 'autoHeight' : 'normal'"
      :grid-options="gridOptions"
      :column-defs="columnDefs"
      :row-height="7 * 6"
      :header-height="7 * 7"
      :context="context"
      :animate-rows="true"
      :row-drag-managaged="true"
      @grid-ready="onGridReady"
    />
  </div>
</template>

<script lang="ts">
import { RowNode } from 'ag-grid-community';
import { Component, Mixins } from 'vue-property-decorator';

import GridMixin from './ts/GridMixin';
import GridInstance from './ts/GridInstance';
import { GridType } from '@/types/config';
import { onDropUnassignedAssets } from '@/config/eventFunctions';

@Component({})
export default class DropGrid extends Mixins(GridMixin) {
  private onDropFunction!: (
    event: DragEvent,
    gridInstance: GridInstance,
  ) => void;

  activeIds: number[] = [];

  async created() {
    if (this.config.gridType === GridType.Drop) {
      if (this.config.onDropFunction) {
        this.onDropFunction = onDropUnassignedAssets;
      }
    } else {
      this.onDropFunction = (event, gridInstance) => {};
    }
  }

  // onDrop(event: DragEvent) {
  //   this.activeIds = this.gridApi
  //     .getRenderedNodes()
  //     .map((node): number => node.data.id);
  //   if (event.dataTransfer) {
  //     const newData = JSON.parse(
  //       event.dataTransfer.getData('application/json'),
  //     );
  //     if (!this.activeIds.includes(newData.id)) {
  //       this.gridInstance.addRows({
  //         rowsToAdd: [newData],
  //         successCallback: () => {
  //           this.gridApi.purgeServerSideCache();
  //           this.activeIds.push(newData.id);
  //         },
  //       });
  //     }
  //   }
  // }

  onDrop(event: DragEvent) {
    // Pass the on
    this.onDropFunction = onDropUnassignedAssets;
    this.onDropFunction(event, this.gridInstance);
  }

  onDragOver = (event: DragEvent) => {
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    event.preventDefault();
  };

  removeEntry(rowNode: RowNode) {
    this.gridInstance.removeRows({
      rowsToRemove: [rowNode.data],
      successCallback: () => {
        this.gridApi.purgeServerSideCache();
        this.activeIds = this.activeIds.filter(
          (id): boolean => id !== rowNode.data.id,
        );
      },
    });
  }
}
</script>

<style lang="scss"></style>
