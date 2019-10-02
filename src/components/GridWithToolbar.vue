<template>
  <div class="grid">
    <div class="grid">
      <v-dialog
        v-model="dialogVisible"
        max-width="50%"
        persistent
        :scrollable="true"
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
        <relationship-builder
          v-else-if="builderVisible"
          :table-name="tableName"
          @close-form="closeBuilder"
        />
      </v-dialog>

      <grid-toolbar
        :toolbar-items="componentProperties.toolbarProps.controls"
        :grid-title="gridTitle"
        @toolbarClick="clickHandler"
      />
      <component
        :is="componentProperties.gridComponent"
        ref="gridComponent"
        :table-name="tableName"
        :show-side-bar="componentProperties.gridProps.showSidebar"
        :auto-height="componentProperties.gridProps.autoHeight"
        :draggable="componentProperties.gridProps.draggable"
        :editable="componentProperties.gridProps.editable"
        :pagination="componentProperties.gridProps.pagination"
        :query-type="componentProperties.gridProps.queryType"
        :custom-columns="componentProperties.gridProps.customColumns"
        @set-grid-instance="setGridInstance"
        @edit="editRow"
        @add="addRow"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { RowNode } from 'ag-grid-community';
import { useStore } from 'vuex-simple';
import { getComponentProperties } from './grid/ts/GridTypes';
import Store from '@/store/store';

import DynamicForm from './grid/DynamicForm.vue';
import RelationshipBuilder from './grid/RelationshipBuilder.vue';
import GridToolbar, { ToolbarOperations } from './grid/GridToolbar.vue';
import GridInstance from './grid/ts/GridInstance';
import { GridComponentOptions, GridType, RowData } from '@/types/grid';
import { dispatchError } from '@/apollo/lib/utils';
import { GRID_CONFIG } from '@/config';

@Component({
  components: {
    GridToolbar,
    DynamicForm,
    RelationshipBuilder,
  },
})
export default class GridWithToolbar extends Vue {
  @Prop(String) readonly tableName!: string;

  @Prop({ default: GridType.Full }) readonly gridType!: GridType;

  @Prop(Object) readonly gridOptions!: GridComponentOptions;

  gridTypeEnum = GridType;

  gridInstance!: GridInstance;

  formVisible: boolean = false;

  builderVisible: boolean = false;

  formData: object = {};

  currentNode!: RowNode;

  config: GridConfigurations;

  saveFormFunction!: (formData: RowData) => void;

  store: Store = useStore(this.$store);

  get componentProperties() {
    return getComponentProperties(this.gridType, this.tableName);
  }

  get dialogVisible(): boolean {
    return this.builderVisible || this.formVisible;
  }

  get columnDefs() {
    return this.gridInstance.columnDefs;
  }

  get gridTitle() {
    if (this.config.title) {
      return this.config.title;
    } else {
      return componentProperties.gridTitle;
    }
  }

  created() {
    this.config = GRID_CONFIG.get(this.tableName);
  }

  closeBuilder() {
    this.builderVisible = false;
    this.gridInstance.gridApi.purgeServerSideCache();
  }

  clickHandler(clickType: ToolbarOperations) {
    const clickFunctions: {
      [key in ToolbarOperations]: (
        clickType?: string,
        presetData?: any,
      ) => void;
    } = {
      [ToolbarOperations.AddRow]: this.addRow,
      [ToolbarOperations.CloneRow]: this.cloneRow,
      [ToolbarOperations.RemoveRow]: this.removeRow,
      [ToolbarOperations.SizeColumns]: this.sizeColumns,
      [ToolbarOperations.FitColumns]: this.fitColumns,
      [ToolbarOperations.TogglePanel]: this.togglePanel,
      [ToolbarOperations.EditLinks]: this.editLinks,
      [ToolbarOperations.MarkDoesNotExist]: this.markDoesNotExist,
      [ToolbarOperations.CollapseAll]: this.collapseAll,
    };
    clickFunctions[clickType]();
  }

  addRow(clickType?: string, presetData: { [key: string]: string } = {}) {
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
    this.formData = presetData;
    this.formVisible = true;
  }

  markDoesNotExist() {
    const selectedRows = this.gridInstance.getSelectedRows();
    const newData = selectedRows.map((row) => ({
      id: row.id,
      entity_exists: !row.role_exists,
    }));

    // // Rearrange any selection from top to bottom
    // try {
    //   const parentIds = selectedRows.map((x) => x.parent);
    //   const lowest = selectedRows.find((x) => !parentIds.includes(x.id));
    //   if (lowest) {
    //     const index = selectedRows.map((x) => x.id).indexOf(lowest.id);
    //     selectedRows.splice(index, 1);
    //     selectedRows.unshift(lowest);
    //   }

    //   selectedRows.forEach((x, index) => {
    //     if (index === selectedRows.length - 1) {
    //       return;
    //     }
    //     const parent = selectedRows.filter(
    //       (x) => selectedRows[index].parent === x.id,
    //     )[0];
    //     const parentIndex = selectedRows.map((x) => x.id).indexOf(parent.id);
    //     selectedRows.splice(parentIndex, 1);
    //     selectedRows.splice(index + 1, 0, parent);
    //   });

    //   if (selectedRows[0].group) {
    //     throw new Error();
    //   }

    //   this.gridInstance.updateRows({
    //     rowsToUpdate: newData,
    //     successCallback: () => {
    //       this.gridInstance.purgeCache();
    //     },
    //   });
    // } catch (error) {
    //   dispatchError(error);
    // }
    this.gridInstance.updateRows({
      rowsToUpdate: newData,
      successCallback: () => {
        this.gridInstance.purgeCache();
      },
    });
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
  }

  collapseAll() {
    this.$refs.gridComponent.collapseAll();
  }

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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  }

  removeRow() {
    this.gridInstance.removeRows({
      rowsToRemove: this.gridInstance.getSelectedRows(),
      successCallback: () => {
        this.gridInstance.purgeCache();
      },
    });
  }

  editLinks() {
    this.builderVisible = true;
  }

  fitColumns() {
    this.gridInstance.sizeColumnsToFit();
  }

  sizeColumns() {
    this.gridInstance.autoSizeColumns();
  }

  setGridInstance(gridInstance: GridInstance) {
    this.gridInstance = gridInstance;
  }

  save(formData: RowData) {
    this.saveFormFunction(formData);
  }

  close() {
    this.formVisible = false;
    this.formData = {};
  }
}
</script>

<style lang="scss">
@import '../../node_modules/ag-grid-community/dist/styles/ag-grid.css';
@import '../../node_modules/ag-grid-community/dist/styles/ag-theme-material.css';

$grid-size: 4px;
$icon-size: 12px;
$virtual-item-height: 5px;

.grid {
  height: 100%;
}

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
  padding-bottom: 10px;
}
.ag-theme-material .ag-menu .ag-menu-separator {
  height: 8px;
}

.ag-theme-material .ag-header-cell-label {
  justify-content: center;
}

.ag-theme-material .ag-header-cell {
  padding-left: 12px;
  padding-right: 5px;
}

.ag-theme-material .ag-menu-option {
  height: 30px;
}
.ag-theme-material .ag-paging-panel {
  height: 45px !important;
}
.alert {
  margin: auto;
  width: 100%;
  top: 40%;
}
</style>
