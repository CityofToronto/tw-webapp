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
        scrollable
        persistent :overlay="false"
        max-width="500px"
        transition="dialog-transition"
      >
        <dynamic-form
          v-if="formVisible"
          :form-display="formVisible"
          :form-data="formData"
          :column-defs="columnDefs"
          :tableName="formName"
          @save-form="save"
          @close-form="formVisible = false"
        />
      </v-dialog>

      <grid-toolbar
        :simple="simpleToolbar"
        :mini="miniToolbar"
        :grid-title="gridTitle"
        :panel-visible="panelVisible"
        @click:toggle="$emit('toggle-panel')"
        @click:add="addRow"
        @click:remove="removeRow"
        @click:fit="fitColumns"
        @click:clone="cloneRow"
        @click:size="sizeColumns"
      />
      <grid-component
        v-if="gridType !== 'drag'"
        :table-name="tableName"
        :show-side-bar="gridSideBar"
        :auto-height="gridAutoHeight"
        :relation="relation"
        :draggable="draggable"
        :editable="editable"
        :pagination="true"
        @set-grid-instance="setGridInstance"
        @edit="editRow"
      />
      <drag-grid-component
        v-else
        :id="'63'"
        :table-name="tableName"
        :depends-on="dependsOn"
        :relation="relation"
      />
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ColDef, RowNode } from 'ag-grid-community';

import DynamicForm from '../forms/DynamicForm.vue';
import GridComponent from './GridComponent.vue';
import GridToolbar from './GridToolbar.vue';
import DragGridComponent from './DragGridComponent.vue';
import GridInstance from './js/grid.instance';

const Props = Vue.extend({
  props: {
    draggable: {
      required: false,
      type: Boolean,
      default: false,
    },
    editable: {
      required: false,
      type: Boolean,
      default: true,
    },
    miniToolbar: {
      required: false,
      default: false,
      type: Boolean,
    },
    tableName: {
      required: true,
      type: String,
    },
    gridTitle: {
      required: true,
      type: String,
    },
    gridSideBar: {
      required: false,
      default: false,
      type: Boolean,
    },
    gridAutoHeight: {
      required: false,
      default: true,
      type: Boolean,
    },
    gridType: {
      required: false,
      default: 'full',
      type: String,
    },
    panelVisible: {
      required: false,
      type: Boolean,
    },
    simpleToolbar: {
      required: false,
      default: false,
      type: Boolean,
    },
  },
});

interface Query {
  tableName: string,
  dependsOn?: string,
  rowData: Record<string, any>,
  id?: number,
  request?: object,
  columns?: string[],
  relationshipType?: string,
}

@Component({
  components: {
    GridToolbar,
    GridComponent,
    DragGridComponent,
    DynamicForm,
  },
})
export default class GridWithToolbar extends Props {
  @Prop(String) readonly relation!: string;

  @Prop(String) readonly dependsOn!: String | null;

  gridInstance!: GridInstance;

  formVisible: boolean = false;

  formData: object = {};

  currentNode!: RowNode;

  operation: string = '';

  // columnDefs: ColDef[] = [];


  get relationalData() {
    if (this.relation) {
      return {
        // tableName: this.$store.getters.getTableName,
        id: this.$store.getters.getRowId,
        tableName: this.$store.getters.getTableName,

      };
    }
    return null;
  }

  get validTable() {
    // TODO reference grid.fields.js if the map exists to have one source of truth
    const validTables = ['legislation', 'trade', 'activity'];
    return !validTables.includes(this.tableName);
  }

  get formName() {
    return `${this.tableName[0].toUpperCase() + this.tableName.slice(1)}`;
  }

  get columnDefs() {
    return this.gridInstance.columnDefs;
  }

  addRow() {
    this.operation = 'add';
    this.formData = {};
    this.formVisible = true;
  }

  cloneRow() {
    this.operation = 'add';
    const rows = this.gridInstance.getSelectedRows();
    const callBack = () => {
      this.gridInstance.purgeCache();
      this.$store.dispatch('notification/setNotification', {
        message: 'Successfully Cloned All Rows',
        color: 'success',
        position: 'top',
      });
    };

    if (rows.length < 2 && rows.length > 0) {
      [this.formData] = rows;
      this.formVisible = true;
    } else {
      rows.forEach((data) => {
        const newData = _.clone(data);
        newData.procedureNumber = data.procedureNumber ? `${data.procedureNumber} - Copy`
          : null;
        this.gridInstance.addRows({
          tableName: this.gridInstance.tableName,
          newData,
          callBack,
        });
      });
    }
  }

  editRow(rowNode: RowNode) {
    this.operation = 'edit';
    this.formData = rowNode.data;
    this.currentNode = rowNode;
    this.formVisible = true;
  }

  removeRow() {
    this.gridInstance.removeRows();
  }

  fitColumns() {
    this.gridInstance.sizeColumnsToFit();
  }

  sizeColumns() {
    this.gridInstance.autoSizeColumns();
  }

  setGridInstance(gridInstance: GridInstance) {
    this.gridInstance = gridInstance;
    ;
  }

  save(formData: any) {
    if (this.operation === 'edit') {
      this.gridInstance.updateRow({
        newData: _.clone(formData),
        rowNode: this.currentNode,
        callBack: this.close,
      });
    } else if (this.operation === 'add') {
      this.gridInstance.addRows({
        tableName: this.gridInstance.tableName,
        newData: _.clone(formData),
        callBack: this.close,
      });
    }
  }

  close() {
    this.formVisible = false;
    this.formData = {};
    this.gridInstance.purgeCache();
  }
}
</script>

<style>
.grid {
  height: 100%;
}
</style>
