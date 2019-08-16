<template>
  <div class="grid">
    <v-alert
      v-if="validTable"
      type="warning"
      prominent
      width="100%"
      class="alert"
    >
      The "{{ tableName }}" table you are querying for does not exist.
    </v-alert>
    <div
      v-else
      class="grid"
    >
      <v-dialog
        v-model="formVisible"
        max-width="500px"
        persistent
        :overlay="false"
        transition="dialog-transition"
      >
        <dynamic-form
          v-if="formVisible"
          :form-display="formVisible"
          :form-data="formData"
          :column-defs="columnDefs"
          :table-name="tableName"
          @save-form="save"
          @close-form="formVisible = false"
        />
      </v-dialog>

      <grid-toolbar
        :toolbar-items="componentProperties.toolbarProps.controls"
        :grid-title="componentProperties.gridTitle"
        @toolbarClick="clickHandler"
      />
      <grid-component
        v-if="gridType !== 'drag'"
        :table-name="tableName"
        :show-side-bar="componentProperties.gridProps.showSidebar"
        :auto-height="componentProperties.gridProps.autoHeight"
        :draggable="componentProperties.gridProps.draggable"
        :editable="componentProperties.gridProps.editable"
        :pagination="componentProperties.gridProps.pagination"
        :query-type="componentProperties.gridProps.queryType"

        @set-grid-instance="setGridInstance"
        @edit="editRow"
      />
      <drag-grid-component
        v-else
        :table-name="tableName"
        :depends-on="dependsOn"
      />
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { RowNode } from 'ag-grid-community';
import { useStore } from 'vuex-simple';
import Store from '@/store/store';

import DynamicForm from './subcomponents/DynamicForm.vue';
import GridComponent from './subcomponents/GridComponent.vue';
import GridToolbar, { ToolbarOperations } from './subcomponents/GridToolbar.vue';
import DragGridComponent from './subcomponents/DragGridComponent.vue';
import GridInstance from './js/GridInstance';
import { QueryType, RowData } from '@/apollo/types';

export enum GridType {Full, OneToMany, ManyToMany, Draggable};

interface GridComponentOptions {
  gridTitle: string;
  gridProps: {
    autoHeight: boolean;
    editable: boolean;
    showSidebar: boolean;
    draggable: boolean;
    pagination: boolean;
    queryType: QueryType;
  };
  toolbarProps: {
    controls: string[];
  };
}

@Component({
  components: {
    GridToolbar,
    GridComponent,
    DragGridComponent,
    DynamicForm,
  },
})
export default class GridWithToolbar extends Vue {
  @Prop(String) readonly tableName!: string;

  @Prop({ default: GridType.Full }) readonly gridType!: GridType;

  gridInstance!: GridInstance;

  formVisible: boolean = false;

  formData: object = {};

  currentNode!: RowNode;

  saveFormFunction!: (formData: RowData) => void;

  store: Store = useStore(this.$store)

  get componentProperties() {
    /**
     * These are pre-defined configurations of grids
     * Options are of the enum GridType
     */
    const getComponentProps = (gridType: GridType):
    {toolbarProps: object; gridProps?: object} => {
      const props = {
        [GridType.Full]: {
          toolbarProps: {
            controls: ['addRow', 'cloneRow', 'removeRow', 'fitColumns', 'sizeColumns', 'togglePanel'],
          },
          gridProps: {
            queryType: QueryType.Direct,
            autoHeight: false,
            showSideBar: true,
          },
        },
        [GridType.OneToMany]: {
          toolbarProps: {
            controls: ['addRow', 'cloneRow', 'removeRow', 'fitColumns', 'sizeColumns'],
          },
          gridProps: {
            queryType: QueryType.OneToMany,
          },
        },
        [GridType.ManyToMany]: {
          toolbarProps: {
            controls: ['removeRow', 'fitColumns', 'sizeColumns'],
          },
          gridProps: {
            queryType: QueryType.ManyToMany,
            editable: false,
          },
        },
        [GridType.Draggable]: {
          toolbarProps: {
            controls: ['addRow', 'cloneRow', 'removeRow', 'fitColumns', 'sizeColumns'],
          },
          gridProps: {
            queryType: QueryType.Direct,
            autoHeight: false,
            draggable: true,
          },
        },
      };
      return props[gridType];
    };

    const componentProps = getComponentProps(this.gridType);

    const defaultProps = {
      gridTitle: this.tableName,
      toolbarProps: {
        ...componentProps.toolbarProps,
      },
      gridProps: {
        editable: true,
        showSidebar: false,
        autoHeight: true,
        draggable: false,
        pagination: false,
        ...componentProps.gridProps,
      },
    };

    return defaultProps;
  }

  get validTable() {
    const validTables = ['legislation', 'trade', 'activity'];
    return !validTables.includes(this.tableName);
  }

  get columnDefs() {
    return this.gridInstance.columnDefs;
  }

  clickHandler(clickType: ToolbarOperations) {
    const clickFunctions: {[key in ToolbarOperations]: () => void} = {
      [ToolbarOperations.AddRow]: this.addRow,
      [ToolbarOperations.CloneRow]: this.cloneRow,
      [ToolbarOperations.RemoveRow]: this.removeRow,
      [ToolbarOperations.SizeColumns]: this.sizeColumns,
      [ToolbarOperations.FitColumns]: this.fitColumns,
      [ToolbarOperations.TogglePanel]: this.togglePanel,
    };
    clickFunctions[clickType]();
  };

  addRow() {
    this.saveFormFunction = (formData: RowData) => {
      this.gridInstance.addRows({
        rowsToAdd: [formData],
        successCallback: () => {
          this.formVisible = false;
          this.gridInstance.purgeCache();
          this.formData = {};
        },
      });
    };
    this.formData = {};
    this.formVisible = true;
  }

  editRow(rowNode: RowNode) {
    this.saveFormFunction = (formData: RowData) => {
      this.gridInstance.updateRows({
        rowsToUpdate: [formData],
        successCallback: () => {
          this.formVisible = false;
          rowNode.setData(formData);
          this.formData = {};
        },
      });
    };
    this.formData = rowNode.data;
    this.formVisible = true;
  };

  cloneRow() {
    const selectedRows = this.gridInstance.getSelectedRows();
    if (selectedRows.length === 1) {
      [this.formData] = selectedRows;
      this.formVisible = true;
      this.saveFormFunction = (formData: RowData) => {
        // Strip the ID so that it is automatically assigned a new one
        const { id, ...ommittedId } = formData;
        this.gridInstance.addRows({
          rowsToAdd: [ommittedId],
          successCallback: () => {
            this.formVisible = false;
            this.gridInstance.purgeCache();
            this.formData = {};
          },
        });
      };
    } else if (selectedRows.length > 1) {
      const rowsWithIdRemoved = selectedRows.map((rowData) => {
        const { id, ...ommittedId } = rowData;
        return ommittedId;
      });
      this.gridInstance.addRows({
        rowsToAdd: rowsWithIdRemoved,
        successCallback: () => {
          this.gridInstance.gridApi.deselectAll();
          this.gridInstance.purgeCache();
        },
      });
    }
  }

  togglePanel() {
    this.store.display.toggleReviewPanel();
  };

  removeRow() {
    this.gridInstance.removeRows({
      rowsToRemove: this.gridInstance.getSelectedRows(),
      successCallback: () => {
        this.gridInstance.purgeCache();
      },
    });
  };

  fitColumns() {
    this.gridInstance.sizeColumnsToFit();
  };

  sizeColumns() {
    this.gridInstance.autoSizeColumns();
  };

  setGridInstance(gridInstance: GridInstance) {
    this.gridInstance = gridInstance;
  };

  save(formData: RowData) {
    this.saveFormFunction(formData);
  }

  close() {
    this.formVisible = false;
    this.formData = {};
  }
}
</script>

<style>
.grid {
  height: 100%;
}
</style>
