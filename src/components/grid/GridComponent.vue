/* eslint-disable no-console, vue/no-unused-components */

<template>
  <ag-grid-vue
    :style="
      config.autoHeight
        ? 'width: 100%;'
        : 'width: 100%; height: calc(100% - 48px);'
    "
    class="ag-theme-material"
    :dom-layout="config.autoHeight ? 'autoHeight' : 'normal'"
    :grid-options="gridOptions"
    :column-defs="columnDefs"
    :row-height="7 * 6"
    :header-height="7 * 7"
    :context="context"
    :animate-rows="true"
    pagination-auto-page-size="true"
    @grid-ready="onGridReady"
    @cell-value-changed="cellValueChanged"
    v-on="events"
  />
</template>

<script lang="ts">
import { Watch, Component, Mixins } from 'vue-property-decorator';
import { RowEvent, RowNode } from 'ag-grid-community';
import GridMixin from './ts/GridMixin';
import { QueryType } from '@/apollo/types';
import TreeviewEditor from './ag-components/TreeviewEditor.vue';
import TreeviewRenderer from './ag-components/TreeviewRenderer.vue';
import TreeviewFilter from './ag-components/TreeviewFilter.vue';
import SetFilter from './ag-components/SetFilter.vue';

// TODO Figure out a better way of loading in additional components since these get loaded even if they aren't used
@Component({
  components: {
    TreeviewEditor,
    TreeviewRenderer,
    TreeviewFilter,
    SetFilter,
  },
})
export default class GridComponent extends Mixins(GridMixin) {
  get getRowId() {
    return this.store.grid.rowId;
  }

  @Watch('getRowId')
  onRowIdChanged() {
    if (this.queryType !== QueryType.Direct) {
      this.gridApi.purgeServerSideCache();
    }
  }

  rowClicked(event: RowEvent): void {
    if (this.queryType === QueryType.Direct) {
      const rowId = event.data.id as number;

      this.store.grid.pushTableData({
        tableName: this.tableName,
        rowId,
      });
    }
  }
}
</script>
