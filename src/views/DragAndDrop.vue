<template>
  <v-layout
    row
    fill-height
    px-2
    py-2
  >
    <v-flex
      xs6
      py-2
      px-3
    >
      <grid-component
        :table-name="'legislation'"
        :draggable="true"
        :editable="false"
      />
    </v-flex>
    <v-flex
      xs6
      py-2
      px-3
      @dragover.prevent
      @drop.prevent
    >
      <drag-grid-component
        :id="'63'"
        :table-name="'legislation'"
        :depends-on="'activity'"
      />
    </v-flex>
  </v-layout>
</template>

<script>
import GridComponent from '../components/grid/GridComponent.vue';
import DragGridComponent from '../components/grid/DragGridComponent.vue';
import { getColumnDefs } from '../components/grid/js/grid.functions';

const GRID_CONFIG = require('../components/grid/js/grid.config');


export default {
  name: 'Drag',
  components: {
    GridComponent,
    DragGridComponent,
  },
  data() {
    return {
      columnDefs: null,
      rowData: null,
    };
  },
  beforeMount() {
    this.gridOptions = {
      columnTypes: GRID_CONFIG.columnTypes,
    };
    getColumnDefs({
      tableName: 'activity',
    }).then(response => {
      this.columnDefs = response;
      this.columnDefs.shift();
      this.columnDefs.unshift({
        valueGetter: "'Drag'",
        dndSource: true,
      });
      this.rowData = [

      ];
    });
  },
  methods: {
    onGridReady() {

    },
    onDragOver(event) {
      const dragSupported = event.dataTransfer.types.indexOf('application/json') >= 0;
      if (dragSupported) {
        event.dataTransfer.dropEffect = 'move';
        event.preventDefault();
      }
    },
    onDrop(event) {
      const jsonData = event.dataTransfer.getData('application/json');
      this.rowData.push(JSON.parse(jsonData));
    },
  },
};
</script>

<style lang="scss">
  @import "../../node_modules/ag-grid-community/dist/styles/ag-grid.css";
  @import "../../node_modules/ag-grid-community/dist/styles/ag-theme-material.css";

  $grid-size: 4px;
  $icon-size: 12px;
  $virtual-item-height: 5px;


  .editorColumn {
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

</style>
