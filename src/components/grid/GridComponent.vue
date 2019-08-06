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
    :pagination="false"

    @grid-ready="onGridReady"
    @cell-value-changed="cellValueChanged"
    @row-clicked="rowClicked"
  />
</template>

<script lang="ts">
import {
  GridOptions, ColDef, GridApi, ColumnApi, AgGridEvent, RowEvent, RowNode, CellValueChangedEvent,
} from 'ag-grid-community';
import { Watch, Component } from 'vue-property-decorator';
import { AgGridVue } from 'ag-grid-vue';
import Vue from 'vue';
import { updateCell, getColumnDefs } from './js/grid.functions';
import ServerSideDatasource from './js/grid.datasource';
import GridInstance from './js/grid.instance';

const GRID_CONFIG = require('./js/grid.config');

const ButtonEdit = Vue.component('ButtonEdit', {
  name: 'ButtonEdit',
  methods: {
    edit() {
      this.params.context.componentParent.launchFormEditor(this.params.node);
      this.params.context.componentParent.gridApi.clearFocusedCell();
    },
  },
  template: '<v-icon @click.stop="edit" class="grid-button">create</v-icon>',
});

const Props = Vue.extend({
  components: {
    AgGridVue,
    // eslint-disable-next-line
    ButtonEdit, 
  },
  props: {
    pagination: {
      required: false,
      default: false,
      type: Boolean,
    },
    editable: {
      required: false,
      default: true,
      type: Boolean,
    },
    relation: {
      required: false,
      default: undefined,
      type: String,
    },
    tableName: {
      required: true,
      type: String,
    },
    showSideBar: {
      required: false,
      type: Boolean,
      default: true,
    },
    autoHeight: {
      required: false,
      type: Boolean,
      default: false,
    },
    draggable: {
      required: false,
      type: Boolean,
      default: false,
    },
  },
});

@Component
export default class GridComponent extends Props {
  context: {componentParent: object} = { componentParent: {} };

  columnApi: ColumnApi = <ColumnApi>{};

  gridApi: GridApi = <GridApi>{};

  gridOptions: GridOptions = <GridOptions>{};

  columnDefs: ColDef[] = [];

  get getRowId() {
    return this.$store.getters.getRowId;
  };

  @Watch('getRowId')
  onRowIdChanged() {
    this.gridApi.purgeServerSideCache();
  }

  created() {
    this.gridOptions = {
      sideBar: this.showSideBar ? GRID_CONFIG.sideBar : false,
      columnTypes: GRID_CONFIG.columnTypes,
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

  onGridReady(params: AgGridEvent): void {
    // Set the API locally and then dispatch the object to the store
    // This allows for the Ag-Grid api to access through the VueX instance
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    // First define the columns and then set the server side data source
    // The data source relies on the column definitions
    // So the data is fetched after the columns are defined

    getColumnDefs({ tableName: this.tableName, editable: this.editable })
      .then(response => {
        this.columnDefs = response;

        // response;

        if (this.draggable) {
          this.columnDefs.shift();
          this.columnDefs.unshift({
            dndSource: true,
            filter: false,
            sortable: false,
            resizable: false,
            lockPosition: true,
            pinned: 'left',
            suppressMenu: true,
            maxWidth: 40,
            width: 40,
            minWidth: 40,
            cellClass: 'thin-column',
          });
        }

        const serverDatasource = new ServerSideDatasource({
          gridOptions: this.gridOptions,
          tableName: this.tableName,
          relation: this.relation,
          columnDefs: this.columnDefs,
        });
        this.gridApi.setServerSideDatasource(serverDatasource);
        const gridInstance = new GridInstance(this.gridApi, this.columnApi, this.tableName);

        // This only wants to work asynchronously!!
        const sizeGridTimeout = new Promise((resolve => {
          setTimeout(() => {
            resolve();
          }, 50);
        }));

        sizeGridTimeout.then(() => {
          this.gridApi.sizeColumnsToFit();
        });

        this.$emit('set-grid-instance', gridInstance);
      })
      .catch(error => {
        console.log(error);
      });
  };

  // Cell updates and call an async function to mutate the grid
  // If the mutation fails, cell value is reset and error message is shown
  cellValueChanged(event: CellValueChangedEvent) {
    updateCell({
      event,
      tableName: this.tableName,
    })
      .catch(error => {
        this.$store.dispatch('notification/setNotification', {
          message: error.message,
          color: 'error',
          position: 'bottom',
        });
      });
  };

  // This method is called by the edit button rendered inside the grid
  launchFormEditor(rowNode: RowNode): void {
    this.$emit('edit', rowNode);
  };

  rowClicked(event: RowEvent): void {
    if (!this.relation) {
      this.$store.dispatch('setTableData', {
        tableName: this.tableName,
        id: event.data.id,
      });
    }
  };
};
</script>

<style lang="scss">
@import "../../../node_modules/ag-grid-community/dist/styles/ag-grid.css";
@import "../../../node_modules/ag-grid-community/dist/styles/ag-theme-material.css";

$grid-size: 4px;
$icon-size: 12px;
$virtual-item-height: 5px;


.thin-column {
  margin: auto !important;
  overflow: visible !important;
  padding: 0px 0px !important;
}
.ag-theme-material .ag-side-bar {
  border-left-width: 0.5px;
  border-left-color: #e2e2e2;
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

.grid-button {
  font-size:18px !important;
  color: #BDBDBD !important;
}

.grid-button:hover {
  color: #616161 !important;
}
</style>
