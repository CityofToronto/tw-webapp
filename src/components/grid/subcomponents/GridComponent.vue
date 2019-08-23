/* eslint-disable no-console, vue/no-unused-components */

<template>
  <ag-grid-vue
    :style="autoHeight ? 'width: 100%;': 'width: 100%; height: calc(100% - 48px)'"
    class="ag-theme-material"
    :dom-layout="autoHeight ? 'autoHeight': 'normal'"
    :grid-options="gridOptions"
    :column-defs="columnDefs"
    :row-height="7 * 6"
    :header-height="7 * 7"
    :context="context"
    :animate-rows="true"
    :row-data-managed="draggable"
    :pagination="pagination"

    @grid-ready="onGridReady"
    @cell-value-changed="cellValueChanged"
    @row-clicked="rowClicked"
  />
</template>

<script lang="ts">
import { AgGridVue } from 'ag-grid-vue';
import {
  Watch, Component, Prop, Vue,
} from 'vue-property-decorator';
import { useStore } from 'vuex-simple';
import {
  GridOptions, ColDef, GridApi, ColumnApi, AgGridEvent, RowEvent, RowNode, CellValueChangedEvent,
} from 'ag-grid-community';
import GridInstance from '../js/GridInstance';
import { QueryType } from '@/apollo/types';
import * as GRID_CONFIG from '../js/grid.config';
import Store from '@/store/store';
import { ColumnDefiner, CustomColumn } from '../js/ColumnDefiner';
import GridButton from './ag-components/GridButton.vue';
import TreeviewEditor from './ag-components/TreeviewEditor.vue';
import TreeviewRenderer from './ag-components/TreeviewRenderer.vue';
import TreeviewFilter from './ag-components/TreeviewFilter.vue';
import SetFilter from './ag-components/SetFilter.vue';


// TODO Figure out a better way of loading in additional components
@Component({
  components: {
    AgGridVue,
    GridButton,
    TreeviewEditor,
    TreeviewRenderer,
    TreeviewFilter,
    SetFilter,
  },
})
export default class GridComponent extends Vue {
  @Prop(String) readonly tableName!: string;

  @Prop(String) readonly queryType!: QueryType;

  @Prop(Boolean) readonly pagination!: boolean;

  @Prop(Boolean) readonly editable!: boolean;

  @Prop(Boolean) readonly autoHeight!: boolean;

  @Prop(Boolean) readonly draggable!: boolean;

  @Prop(Boolean) readonly showSideBar!: boolean;

  store: Store = useStore(this.$store);

  context: {componentParent: object} = { componentParent: {} };

  columnApi!: ColumnApi;

  gridApi!: GridApi;

  gridOptions!: GridOptions;

  columnDefs: ColDef[] = [];

  gridInstance!: GridInstance;


  get getRowId() {
    return this.store.grid.rowId;
  };

  @Watch('getRowId')
  onRowIdChanged() {
    if (this.queryType !== QueryType.Direct) {
      this.gridApi.purgeServerSideCache();
    }
  }

  async created() {
    this.gridOptions = {
      sideBar: this.showSideBar,
      rowSelection: 'multiple',
      rowDeselection: true,
      rowModelType: GRID_CONFIG.rowModelType,
      cacheBlockSize: GRID_CONFIG.cacheBlockSize,
      maxBlocksInCache: GRID_CONFIG.maxBlocksInCache,
    };

    this.context = {
      componentParent: this,
    };
  };

  async onGridReady(params: AgGridEvent): Promise<void> {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    const colDefiner = new ColumnDefiner(this.tableName, this.editable, [CustomColumn.Edit]);
    this.columnDefs = await colDefiner.getColumnDefs();

    this.gridInstance = new GridInstance({
      columnApi: this.columnApi,
      gridApi: this.gridApi,
      Provider: GridInstance.getProvider(
        this.queryType,
        this.tableName,
        // pass in a reference to VueX so that the datasource reacts with updates elsewhere
        this.store.grid,
        this.gridApi,
      ),
    });
    this.gridApi.setServerSideDatasource(this.gridInstance.gridDatasource);

    this.$emit('set-grid-instance', this.gridInstance);
  };

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

<style lang="scss">
@import "../../../../node_modules/ag-grid-community/dist/styles/ag-grid.css";
@import "../../../../node_modules/ag-grid-community/dist/styles/ag-theme-material.css";

$grid-size: 4px;
$icon-size: 12px;
$virtual-item-height: 5px;


.thin-column {
  margin: auto !important;
  overflow: visible !important;
  padding: 0px 0px !important;
}

// Adds a border left of the ag-grid sidebar
.ag-theme-material .ag-side-bar {
  border-left-width: 0.5px;
  border-left-color: #e2e2e2;
}

// Styling for grid dropdown list
.ag-theme-material .ag-rich-select .ag-rich-select-list {
  height: auto !important;
  padding-bottom:10px;
}
.ag-theme-material .ag-menu .ag-menu-separator {
  height: 8px;
}

.ag-theme-material .ag-header-cell-label {
  justify-content: center;
}

.ag-theme-material .ag-header-cell {
  padding-left: 12px;
  padding-right:5px;
}

.ag-theme-material .ag-menu-option {
  height: 30px;
}
.alert {
  margin: auto;
  width: 100%;
  top: 40%
}


</style>
