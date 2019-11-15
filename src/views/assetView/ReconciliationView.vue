<template>
  <v-layout row wrap fill-height px-4 py-2>
    <splitpanes>
      <pane min-size="33" size="67" style="padding: 2px;">
        <v-sheet height="100%" elevation="2">
          <grid-with-toolbar :config="reconciliationConfig" />
        </v-sheet>
      </pane>
      <pane min-size="20" size="33" style="padding: 2px;">
        <v-sheet height="100%" elevation="2">
          <v-tabs v-model="tabState" right="" height="48">
            <v-tab @click="changeView">Inactive</v-tab>
            <v-tab @click="changeView">Trash</v-tab>
          </v-tabs>
          <v-tabs-items v-model="tabState" style="height: 100%">
            <v-tab-item style="height: calc(100% - 48px)">
              <splitpanes horizontal>
                <pane>
                  <grid-with-toolbar :config="unassignedConfig" />
                </pane>
                <pane>
                  <grid-with-toolbar :config="orphanConfig" />
                </pane>
              </splitpanes>
            </v-tab-item>
            <v-tab-item style="height: calc(100% - 48px)">
              <splitpanes horizontal>
                <pane>
                  <grid-with-toolbar :config="trashAssetConfig" />
                </pane>
                <pane>
                  <grid-with-toolbar :config="trashRoleConfig" />
                </pane>
              </splitpanes>
            </v-tab-item>
          </v-tabs-items>
        </v-sheet>
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
  icon: ({ data }) => (isApproved(data) ? 'keyboard_tab' : ''),
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
    if (!isApproved(data)) return '';
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
        role_exists: !params?.data?.role_exists,
      };
      params.context.gridInstance
        .updateRows({
          rowsToUpdate: [updateData],
        })
        .then(() => params.context.vueStore.grid.forceUpdateAllGrids());
    }
  },
});

export const onDropAsset = gridEvents.createGridEvent<DragEvent>(function() {
  return {
    type: 'drop',
    callback: () => {
      if (this.event.dataTransfer) {
        const eventData = JSON.parse(
          this.event.dataTransfer.getData('text/plain'),
        );
        if (!eventData.asset_id) return;
        const rowData = {
          id: eventData.asset_id,
          role_id: 0,
        };

        this.gridInstance
          .updateRows({
            rowsToUpdate: [rowData],
            refresh: false,
          })
          .then(() => this.vueStore.grid.forceUpdateAllGrids());
      }
    },
  };
});

const isApproved = (data: {
  project_id: number;
  approved: boolean;
  role_missing_from_registry: boolean;
}) => isCurrentProject(data?.project_id) && data.approved;

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

  tabState: number | null = null;

  currentView: {
    tableName: string;
  } = { tableName: 'orphan_view' };

  changeView() {
    this.currentView.tableName =
      this.currentView.tableName === 'orphan_view'
        ? 'garbage_can_reconciliation_view'
        : 'orphan_view';
  }

  private reconciliationConfig: GridConfiguration = {
    tableName: 'reconciliation_view',
    title: 'Reconciliation',
    treeData: true,
    groupSuppressAutoColumn: true,
    suppressRowClickSelection: true,
    gridButtons: [markDoesNotExist, addChildButton], // register our buttons
    toolbarItems: [
      toolbarItems.expandAll(),
      toolbarItems.collapseAll(),
      toolbarItems.fitColumns(),
      toolbarItems.sizeColumns(),
      toolbarItems.togglePanel(),
    ],
    contextMenu: [adoptBranch(undefined, this.currentView), orphanBranch()], // register our context menu item
    getDataPath: (data) => data?.full_path.split('.'), // tell agGrid how parse tree data
    gridEvents: [
      gridEvents.rowDragLeft(), // all these are registered for rearranging hierarchy
      gridEvents.rowDragEnd(),
      gridEvents.rowDragMoved(),
      gridEvents.rowDragEnd(),
      gridEvents.doubleClickView(), // double click to open view (shows more details)
    ],
    columnOrder: ['id', 'role_number', 'role_name', 'asset_serial_number'],
    // Size the columns on initialization
    gridInitializedEvent: ({ gridInstance }) =>
      gridInstance.gridApi.sizeColumnsToFit(),
    rowClassRules: {
      'background-grey': ({ data }: RowStyleParams) => !isApproved(data),
      'text-grey': ({ data }: RowStyleParams) => !isApproved(data),
    },
    overrideColumnDefinitions: [
      {
        headerName: 'Role',
        children: [
          {
            field: 'id',
            showRowGroup: true,
            resizable: true,
            width: 400,
            // Only reserved roles will be draggable
            rowDrag: ({ data }) => isApproved(data),
            valueFormatter: (params) => params?.data?.role_number ?? 'unknown',
            headerName: 'Role Number',
            cellRenderer: 'agGroupCellRenderer',
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
          {
            field: 'role_number',
            hide: true,
            cellClassRules: roleClassRules, // apply css rules
          },
          {
            field: 'role_name',
            cellClassRules: roleClassRules, // apply css rules
          },
        ],
      },
      {
        headerName: 'Asset',
        headerClass: 'asset-separator', // apply the separator between role and asset
        children: [
          {
            field: 'asset_serial_number',
            cellType: 'rearrangeCell', // define cell to a rearrange cell
            showInForm: false, // disable this field when adding a child
            showInView: true, // show this when double clicking
            conditional: ({ data, value }) => isApproved(data), // this controls whether a row is draggable
            headerClass: 'asset-separator', // apply the separator between role and asset
            cellClass: 'asset-separator',
            cellClassRules: assetClassRules, // apply css rules
          },
        ],
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
    rowClassRules: {
      'background-grey': (params: RowStyleParams) =>
        !isCurrentProject(params?.data?.project_id),
    },
    // Size the columns on initialization
    gridInitializedEvent: ({ gridInstance }) =>
      gridInstance.gridApi.sizeColumnsToFit(),
    autoGroupColumnDef: {
      resizable: true,
      width: 400,
      headerName: 'Role Number',
      valueFormatter: (params) => params?.data?.role_number ?? 'unknown',
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

  private trashAssetConfig: GridConfiguration = {
    ...this.unassignedConfig,
    title: 'Deleted Assets',
    tableName: 'garbage_can_unassigned_assets',
    toolbarItems: [toolbarItems.fitColumns(), toolbarItems.sizeColumns()],
    gridEvents: [],
  };

  private trashRoleConfig: GridConfiguration = {
    ...this.orphanConfig,
    title: 'Deleted Roles',
    tableName: 'garbage_can_reconciliation_view',
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
  &--horizontal > &__splitter {
    min-height: 12px;
  }
  &--vertical > &__splitter {
    min-width: 8px;
  }
}
</style>
