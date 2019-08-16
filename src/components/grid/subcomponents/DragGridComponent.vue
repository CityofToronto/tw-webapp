// This component contains logic to accept a drag operation from another grid-list-lg
// It fetches data on load and renders it client side
// Also has a in-grid button to remove the current row
// When a row is added or removed, the data is sent up to the parent component u
// Under the @update event

<template>
  <div
    style="height:100%"
    @drop="onDrop"
    @draggover="onDragOver"
    @dragend="onDrop"
  >
    <ag-grid-vue
      style="width: 100%; height: 100%"
      class="ag-theme-material"
      :column-defs="columnDefs"
      :row-data="rowData"
      :row-height="7 * 6"
      :header-height="7 * 7"
      :animate-rows="true"
      @grid-ready="onGridReady"
    />
  </div>
</template>

<script>
import Vue from 'vue';
import { AgGridVue } from 'ag-grid-vue';
import apolloClient from '@/apollo';

const ButtonRemove = Vue.component('ButtonRemove', {
  methods: {
    remove() {
      /*
       * Usually $parent is bad, but this just triggers removeEntry
       * First $parent is AgGridVue, its parent is this component
       */
      this.$parent.$parent.removeEntry(this.params.node);
    },
  },
  template: '<v-icon @click.stop="remove" class="remove-button">delete</v-icon>',
});

export default {
  name: 'DragGridComponent',
  components: {
    AgGridVue,
    // eslint-disable-next-line
    ButtonRemove,
  },
  props: {
    tableName: {
      required: true,
      type: String,
    },
    dependsOn: {
      required: true,
      type: String,
    },
    id: {
      required: true,
      type: [String, Number],
    },
    relation: {
      required: true,
      type: String,
    },
  },
  data() {
    return {
      rowData: null,
      columnDefs: null,
      context: null,
    };
  },
  async beforeMount() {
    // Get Columns from Database
    const columns = await apolloClient.getColumns(this.tableName);

    // Make a simple grid with no editing, sort by ID
    this.columnDefs = columns.map((column) => ({
      headerName: FIELDS.HEADERS.get(column.name),
      field: column.name,
      resizable: true,
      filter: true,
      sort: column.name === 'id' ? 'asc' : null,
      sortable: true,
    }));

    // Add the remove column on the left side
    this.columnDefs.unshift({
      headerName: '  ',
      sortable: false,
      filter: false,
      pinned: 'left',
      resizeable: false,
      maxWidth: 40,
      minWidth: 40,
      width: 40,
      suppressMenu: true,
      cellClass: 'thin-column',
      cellRendererFramework: 'ButtonRemove',
      lockPosition: true,
    });

    this.rowData = await getRows({
      tableName: this.tableName,
      dependsOn: this.dependsOn,
      relationshipType: this.relation,
      id: this.id,
    });
  },
  methods: {
    onDrop(event) {
      const newData = JSON.parse(event.dataTransfer.getData('application/json'));
      const currentIds = this.rowData.map((x) => x.id);
      if (!currentIds.includes(newData.id)) {
        this.rowData.push(newData);
      }
      // Emit the data upwards to the form for submission handling
      this.$emit('updated', this.rowData);
    },
    onDragOver(event) {
      const dragSupported = event.dataTransfer.types.indexOf('application/json') >= 0;
      if (dragSupported) {
        // eslint-disable-next-line
        event.dataTransfer.dropEffect = 'move';
        event.preventDefault();
      }
    },
    removeEntry(event) {
      // Remove the entry from the rowData array
      const idToRemove = event.data.id;
      this.rowData = this.rowData.filter((element) => element.id !== idToRemove);

      this.$emit('updated', this.rowData);
    },
    onGridReady(params) {
      // Size Columns to Fit, set timeout to wait for render first
      const waitPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 100);
      });
      waitPromise.then(() => {
        params.api.sizeColumnsToFit();
      });
    },
  },
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

.remove-button {
  font-size:18px !important;
  color: #BDBDBD !important;
}

.remove-button:hover {
  color: #616161 !important;
}
</style>
