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
import { QueryType } from '@/apollo/types';

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

  operation: string = '';

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
      this.$store.dispatch('notification/pushNotification', {
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
          newData,
          callBack,
        });
      });
    }
  }

  clickHandler(clickType: ToolbarOperations) {
    this[clickType]();
  };

  togglePanel() {
    this.store.display.toggleReviewPanel();
  };

  editRow(rowNode: RowNode) {
    this.operation = 'edit';
    this.formData = rowNode.data;
    this.currentNode = rowNode;
    this.formVisible = true;
  };

  removeRow() {
    this.gridInstance.removeRows();
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

  save(formData: any) {
    /*
     * if (this.operation === 'edit') {
     *   this.gridInstance.updateRows({
     *     newData: { ...formData },
     *     rowNode: this.currentNode,
     *     callBack: this.close,
     *   });
     */
    if (this.operation === 'add') {
      this.gridInstance.addRows({
        rowsToAdd: [_.clone(formData)],
        successCallback: this.close,
        failCallback: () => {},
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
