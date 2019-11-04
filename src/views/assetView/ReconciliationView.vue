<template>
  <v-layout row wrap fill-height px-4 py-2>
    <splitpanes>
      <pane min-size="33" size="67">
        <v-sheet height="100%" elevation="2">
          <grid-with-toolbar :config="reconciliationConfig" />
        </v-sheet>
      </pane>
      <pane min-size="20" size="33">
        <splitpanes horizontal>
          <pane>
            <v-sheet height="100%" elevation="2">
              <grid-with-toolbar :config="unassignedConfig" />
            </v-sheet>
          </pane>
          <pane>
            <v-sheet height="100%" elevation="2">
              <grid-with-toolbar :config="orphanConfig" />
            </v-sheet>
          </pane>
        </splitpanes>
      </pane>
    </splitpanes>
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import GridWithToolbar from '@/components/GridWithToolbar.vue';
import { GridType } from '@/types/grid';
import { GridConfiguration } from '@/types/config';

import agComponents from '@/components/grid/ag-components';
import * as toolbarItems from '@/components/grid/ts/toolbarItems';
import * as contextItems from '@/components/grid/ts/contextItems';
import * as gridEvents from '@/components/grid/ts/gridEvents/';
import * as gridButtons from '@/components/grid/ts/ColumnFactory/gridButtons';
import { isCurrentProject } from './common/conditionals';
import { orphanBranch, adoptBranch } from './common/orphanage';
import { ICellRendererParams, CellClassParams } from 'ag-grid-community';
import { CellType, RowStyleParams, MergeContext } from '@/types/grid';
import Store from '@/store/store';
import { useStore } from 'vuex-simple';
import { ClassRules } from '@/types/agGrid';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

/**
 * This defines role styling
 */
export const roleClassRules: ClassRules = {
  'background-green': ({ data }) => data?.role_missing_from_registry,
  'background-light-blue': ({ data }) => data?.parent_changed,
};

/**
 * This defines asset styling
 */
export const assetClassRules: ClassRules = {
  'background-green': ({ data }) => data?.asset_missing_from_registry,
  'background-light-blue': ({ data }) => data?.role_changed,
};

/**
 * Creates a custom grid button addChildButton
 * It performs the addChildToRow function
 * It is disabled if role is marked as does not exist
 */
const addChildButton = gridButtons.createGridButton({
  icon: ({ data }) =>
    !data?.role_exists || !data?.approved || !isCurrentProject(data?.project_id)
      ? ''
      : 'keyboard_tab',
  clickFunction: ({ node, context }) =>
    context.gridInstance.componentApi.addChildToRow(node),
});

/**
 * Creates a custom grid button markDoesNotExist
 * It deletes entities that role_missing_from_registry = true
 * Otherwise, it marks as does not exist
 */
const markDoesNotExist = gridButtons.createGridButton({
  icon: ({ data }) => {
    if (!isCurrentProject(data.project_id) || !data.approved) return '';
    return data?.role_missing_from_registry ? 'delete' : 'fa-eraser';
  },
  clickFunction: (params) => {
    if (params.data.role_missing_from_registry) {
      const removeData = {
        id: params.data.id,
      };
      params.context.gridInstance.removeRows({
        rowsToRemove: [removeData],
      });
    } else {
      const updateData = {
        id: params.data.id,
        role_exists: !params.data.role_exists,
      };
      params.context.gridInstance
        .updateRows({
          rowsToUpdate: [updateData],
        })
        .then(() => params.context.vueStore.grid.forceUpdateAllGrids());
    }
  },
});

export const onDropAsset = gridEvents.createGridEvent<DragEvent>({
  type: 'drop',
  callback: ({ event, gridInstance, vueStore }) => {
    if (event.dataTransfer) {
      const eventData = JSON.parse(event.dataTransfer.getData('text/plain'));
      if (!eventData.asset_id) return;
      const rowData = {
        id: eventData.asset_id,
        role_id: 0,
      };

      gridInstance
        .updateRows({
          rowsToUpdate: [rowData],
          refresh: false,
        })
        .then(() => vueStore.grid.forceUpdateAllGrids());
    }
  },
});

@Component({
  components: {
    GridWithToolbar,
    Splitpanes,
    Pane,
  },
})
export default class ReconciliationView extends Vue {
  // Define the VueX Store
  store: Store = useStore(this.$store);

  async created() {
    // Subscribe to the orphanView
    this.store.grid.subscribeToOrphanView();
  }

  private reconciliationConfig: GridConfiguration = {
    tableName: 'reconciliation_view',
    title: 'Reconciliation',
    treeData: true,
    suppressRowClickSelection: true,
    gridButtons: [markDoesNotExist, addChildButton], // register our buttons
    toolbarItems: [
      toolbarItems.expandAll(),
      toolbarItems.collapseAll(),
      toolbarItems.fitColumns(),
      toolbarItems.sizeColumns(),
    ],
    contextMenu: [adoptBranch(), orphanBranch()], // register our context menu item
    getDataPath: (data) => data?.full_path.split('.'), // tell agGrid how parse tree data
    gridEvents: [
      gridEvents.rowDragLeft(), // all these are registered for rearranging hierarchy
      gridEvents.rowDragEnd(),
      gridEvents.rowDragMoved(),
      gridEvents.rowDragEnd(),
      gridEvents.doubleClickView(), // double click to open view (shows more details)
    ],
    columnOrder: ['id', 'role_number', 'role_name', 'asset_serial_number'],
    omittedColumns: [
      'project_id',
      'role_exists',
      'role_missing_from_registry',
      'asset_exists',
      'asset_missing_from_registry',
      'full_path',
      'parent_changed',
      'role_changed',
      'parent',
      'asset_id',
      'approved',
    ],
    // Size the columns on initialization
    gridInitializedEvent: ({ gridInstance }) =>
      gridInstance.gridApi.sizeColumnsToFit(),
    autoGroupColumnDef: {
      resizable: true,
      width: 400,
      // Only reserved roles will be draggable
      rowDrag: (params) => isCurrentProject(params?.data.project_id), // row drag only for reserved projects
      valueFormatter: (params) => params?.data.role_number ?? 'unknown',
      headerName: 'Role Number',
      cellRendererParams: {
        suppressCount: true, // the count is weird when rearranging, so disabled it
      },
      cellClassRules: {
        // css styling that highlights the potential parent when rearranging the hierarchy
        'hover-over': (params: MergeContext<ICellRendererParams>) =>
          params.node === params.context.vueStore.grid.potentialParent,
        ...roleClassRules,
      },
    },
    rowClassRules: {
      'background-grey': (params: RowStyleParams) =>
        // if entity not reserved by current project, show grey
        !isCurrentProject(params?.data.project_id) || !params?.data.approved,
      'text-grey': (params: RowStyleParams) =>
        // if the role doesn't exist or not reserved by current project
        !params?.data.role_exists ||
        !isCurrentProject(params?.data.project_id) ||
        !params?.data.approved,
    },
    overrideColumnDefinitions: [
      {
        field: 'id',
        headerName: 'Role ID',
        hide: true,
        showInForm: false,
      },
      {
        field: 'role_number',
        hide: true,
        cellClassRules: roleClassRules, // apply css rules
      },
      {
        field: 'role_name',
        cellClassRules: roleClassRules, // apply css rules
      },
      {
        field: 'asset_serial_number',
        cellType: 'rearrangeCell', // define cell to a rearrange cell
        showInForm: false, // disable this field when adding a child
        showInView: true, // show this when double clicking
        conditional: (params) =>
          (isCurrentProject(params?.data.project_id) &&
            params?.data.role_exists) ||
          (params?.data.approved && params?.data.role_exists), // this controls whether a row is draggable
        headerClass: 'asset-separator', // apply the separator between role and asset
        cellClass: 'asset-separator',
        cellClassRules: assetClassRules, // apply css rules
      },
    ],
  };

  private unassignedConfig: GridConfiguration = {
    toolbarItems: [
      toolbarItems.addRow(), // register toolbar items
      toolbarItems.copyRow(),
      toolbarItems.removeRow(),
    ],
    title: 'Assets Without a Role',
    tableName: 'unassigned_assets',
    omittedColumns: ['asset_missing_from_registry'],
    rowClassRules: assetClassRules,
    gridEvents: [onDropAsset(), gridEvents.dragOver()], // register the asset drop logic
    overrideColumnDefinitions: [
      {
        field: 'asset_serial_number',
        headerName: 'Asset Serial Number',
        cellType: 'rearrangeCell',
      },
      {
        field: 'id',
        hide: true,
        showInForm: false,
      },
    ],
  };

  private orphanConfig: GridConfiguration = {
    title: 'Orphaned Roles',
    gridType: 'normal',
    tableName: 'orphan_view',
    treeData: true,
    getDataPath: (data) => data?.full_path.split('.'),
    columnOrder: ['id', 'role_number', 'role_name', 'asset_serial_number'],
    toolbarItems: [toolbarItems.fitColumns(), toolbarItems.sizeColumns()],
    omittedColumns: [
      'asset_id',
      'role_name',
      'role_exists',
      'role_missing_from_registry',
      'asset_exists',
      'asset_missing_from_registry',
      'full_path',
      'parent_changed',
      'role_changed',
      'parent',
    ],
    rowClassRules: {
      'background-grey': (params: RowStyleParams) =>
        !isCurrentProject(params?.data.project_id),
    },
    // Size the columns on initialization
    gridInitializedEvent: ({ gridInstance }) =>
      gridInstance.gridApi.sizeColumnsToFit(),
    autoGroupColumnDef: {
      resizable: true,
      width: 400,
      headerName: 'Role Number',
      valueFormatter: (params) => params?.data.role_number ?? 'unknown',
      cellRendererParams: {
        suppressCount: true,
        checkbox: true,
      },
    },
    overrideColumnDefinitions: [
      {
        field: 'id',
        hide: true,
      },
      {
        field: 'project_id',
        hide: true,
      },
    ],
  };
}
</script>

<style lang="scss">
.ag-theme-material {
  .asset-separator {
    border-left: 3px solid #bdbdbd;
  }
  .background-grey {
    background: #eceff1;
  }
  .background-light-blue {
    background: #e0f7fa;
  }
  .background-green {
    background: #e8f5e9;
  }

  .text-grey {
    color: #bdbdbd;
  }
}
.splitpanes {
  .splitpanes__pane {
    padding: 3px;
  }
  &--horizontal > &__splitter {
    min-height: 12px;
  }
  &--vertical > &__splitter {
    min-width: 8px;
  }
}
</style>
