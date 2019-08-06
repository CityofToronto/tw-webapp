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
      <form-loader
        :display="formVisible"
        :type="formName"
        :data="formData"
        @save="save"
        @close="formVisible = false"
      />
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

import FormLoader from '../forms/FormLoader.vue';
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
  rowData: [],
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
    FormLoader,
  },
})
export default class GridWithToolbar extends Props {
  @Prop(String) readonly relation!: string;

  @Prop(String) readonly dependsOn!: String | null;

  gridInstance!: GridInstance;

  formVisible: boolean = false;

  formData: object = {};

  currentNode: object = {};

  operation: string = '';


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
    return `${this.tableName[0].toUpperCase() + this.tableName.slice(1)}Form`;
  }

  addRow() {
    this.operation = 'add';
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
          rowData: newData,
          callBack,
        });
      });
    }
  }

  editRow(rowNode) {
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

  setGridInstance(gridInstance: GridInstance) {
    this.gridInstance = gridInstance;
  }

  save(formData) {
    if (this.operation === 'edit') {
      this.gridInstance.updateRow({
        rowData: _.clone(formData),
        rowNode: this.currentNode,
        callBack: this.close,
      });
    } else if (this.operation === 'add') {
      this.gridInstance.addRows({
        rowData: _.clone(formData),
        callBack: this.close,
      });
    }
  }

  close() {
    this.formVisible = false;
    this.formData = null;

    this.gridInstance.purgeCache();
  }
}
</script>

<style>
.grid {
  height: 100%;
}
</style>
