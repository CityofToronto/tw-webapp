/* eslint-disable no-console, vue/no-unused-components */

<template>
  <ag-grid-vue
    :style="autoHeight ? 'width: 100%;': 'width: 100%; height: calc(100% - 48px);'"
    class="ag-theme-material"
    :dom-layout="autoHeight ? 'autoHeight': 'normal'"
    :grid-options="gridOptions"
    :column-defs="columnDefs"
    :row-height="7 * 6"
    :header-height="7 * 7"
    :context="context"
    :animate-rows="true"
    :row-data-managed="draggable"
    :pagination="true"
    pagination-auto-page-size="true"


    @grid-ready="onGridReady"
    @cell-value-changed="cellValueChanged"
    @row-clicked="rowClicked"
  />
</template>

<script lang="ts">
import {
  Watch, Component, Mixins,
} from 'vue-property-decorator';
import {
  RowEvent, RowNode, CellValueChangedEvent,
} from 'ag-grid-community';
import GridMixin from '../ts/GridMixin';
import { QueryType } from '@/apollo/types';
import TreeviewEditor from './ag-components/TreeviewEditor.vue';
import TreeviewRenderer from './ag-components/TreeviewRenderer.vue';
import TreeviewFilter from './ag-components/TreeviewFilter.vue';
import SetFilter from './ag-components/SetFilter.vue';


// TODO Figure out a better way of loading in additional components
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
  };

  @Watch('getRowId')
  onRowIdChanged() {
    if (this.queryType !== QueryType.Direct) {
      this.gridApi.purgeServerSideCache();
    }
  }

  /**
   * Cell updates and call an async function to mutate the grid
   * If the mutation fails, cell value is reset and error message is shown
   */
  cellValueChanged(event: CellValueChangedEvent) {
    /**
     * This technically updates the entire row, but the rest of the row
     * has the old data. This was done to avoid implementing updateRow and updateCell
     * which were too similar to justify both.
     */

    this.gridInstance.updateRows({
      rowsToUpdate: [event.data],
      successCallback: (): void => {
        // Update row if successfull
        event.node.setData(event.data);
      },
      failCallback: (): void => {
        // Revert row if failure
        event.node.setDataValue(event.column.getColId(), event.oldValue);
      },
    });
  };

  removeEntry(rowNode: RowNode) {
    this.gridInstance.removeRows({
      rowsToRemove: [rowNode.data],
      successCallback: () => {
        this.gridApi.purgeServerSideCache();
      },
    });
  };

  // This method is called by the edit button rendered inside the grid
  launchFormEditor(rowNode: RowNode): void {
    this.$emit('edit', rowNode);
  };

  rowClicked(event: RowEvent): void {
    if (this.queryType === QueryType.Direct) {
      const rowId = event.data.id as number;

      this.store.grid.pushTableData({
        tableName: this.tableName,
        rowId,
      });
    }
  };
};
</script>
