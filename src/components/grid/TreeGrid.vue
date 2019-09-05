<template>
  <ag-grid-vue
    :style="
      autoHeight ? 'width: 100%;' : 'width: 100%; height: calc(100% - 48px);'
    "
    class="ag-theme-material"
    :dom-layout="autoHeight ? 'autoHeight' : 'normal'"
    :grid-options="gridOptions"
    :column-defs="columnDefs"
    :row-height="7 * 6"
    :header-height="7 * 7"
    :context="context"
    :animate-rows="true"
    :pagination="true"
    :pagination-auto-page-size="true"
    :auto-group-column-def="autoGroupColumnDef"
    @grid-ready="onGridReady"
    @row-drag-move="onRowDragMove"
    @row-drag-end="onRowDragEnd"
  />
</template>

<script lang="ts">
import { RowDragEnterEvent, RowDragMoveEvent, ColDef } from 'ag-grid-community';
import { Component, Mixins } from 'vue-property-decorator';
import GridMixin from './ts/GridMixin';
import TreeTransformer from './ts/GridProviders/GridTransformer/TreeTransformer';
import AliasCell from '@/components/grid/ag-components/AliasCell.vue';

@Component({
  components: {
    AliasCell,
  },
})
export default class GridComponent extends Mixins(GridMixin) {
  autoGroupColumnDef: ColDef = {
    resizable: true,
    rowDrag: true,
    cellRendererParams: {
      aliasColumn: 'name',
      innerRendererFramework: AliasCell,
    },
  };

  async created() {
    this.dataTransformer = new TreeTransformer();
    this.gridOptions = {
      ...this.gridOptions,
      treeData: true,
      // dataItem.group is populated in the TreeTransformer
      // boolean to show whether or not there are children
      isServerSideGroup: (dataItem): boolean => dataItem.group,
      // What column to group by, here it is the id column as it should
      // always be present in the data
      getServerSideGroupKey: (dataItem): string => dataItem.id,
    };
  }

  onRowDragMove(params: RowDragMoveEvent) {
    console.log('Row Moving');
  }

  onRowDragEnd(params: RowDragEnterEvent) {
    console.log('Row Drag Ending', params);
  }
}
</script>
