<template>
  <v-layout row wrap fill-height px-4 py-2>
    <v-flex md6 lg8>
      <v-sheet height="100%" elevation="2">
        <grid-with-toolbar :config="reconciliationConfig" />
      </v-sheet>
    </v-flex>
    <v-flex md6 lg4>
      <v-layout column fill-height>
        <v-flex xs6 px-2 pb-1>
          <v-sheet height="100%" elevation="2">
            <grid-with-toolbar :config="unassignedConfig" />
          </v-sheet>
        </v-flex>
        <v-flex xs6 px-2 pt-1>
          <v-sheet height="100%" elevation="2">
            <grid-with-toolbar :config="orphanConfig" />
          </v-sheet>
        </v-flex>
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import GridWithToolbar from '@/components/GridWithToolbar.vue';
import { GridType } from '@/types/grid';
import { GridConfiguration } from '../../types/config';

import agComponents from '@/components/grid/ag-components';
import * as toolbarItems from '@/components/grid/ts/toolbarItems';
import * as contextItems from '@/components/grid/ts/contextItems';
import * as gridEvents from '@/components/grid/ts/gridEvents';
import * as gridButtons from '@/components/grid/ts/ColumnFactory/gridButtons';
import { ICellRendererParams, CellClassParams } from 'ag-grid-community';
import { CellType, RowStyleParams, MergeContext } from '@/types/grid';
import Store from '@/store/store';
import { useStore } from 'vuex-simple';

type ClassRules = {
  [cssClassName: string]: (params: MergeContext<CellClassParams>) => boolean;
};

const markDoesNotExist = gridButtons.createGridButton({
  icon: ({ data }) =>
    data.role_missing_from_registry ? 'delete' : 'remove_red_eye',
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
      params.context.gridInstance.updateRows({
        rowsToUpdate: [updateData],
      });
    }
  },
});

const roleClassRules: ClassRules = {
  'background-green': ({ data }) =>
    data ? data.role_missing_from_registry : false,
  'background-light-blue': ({ data }) => (data ? data.parent_changed : false),
};

const assetClassRules: ClassRules = {
  'background-green': ({ data }) =>
    data ? data.asset_missing_from_registry : false,
  'background-light-blue': ({ data }) => (data ? data.role_changed : false),
};

@Component({
  components: {
    GridWithToolbar,
  },
})
export default class ReconciliationView extends Vue {
  store: Store = useStore(this.$store);
  async created() {
    await this.store.grid.fetchOrphanID();
  }

  private reconciliationConfig: GridConfiguration = {
    tableName: 'reconciliation_view',
    title: 'Reconciliation',
    gridType: 'normal',
    treeData: true,
    suppressRowClickSelection: true,
    gridButtons: [markDoesNotExist, gridButtons.addChildButton],
    toolbarItems: [
      toolbarItems.addRow,
      toolbarItems.expandAll,
      toolbarItems.collapseAll,
      toolbarItems.fitColumns,
      toolbarItems.sizeColumns,
    ],
    contextMenu: [contextItems.orphanBranch],
    getDataPath: (data) => data.full_path.split('.'),
    gridEvents: [
      gridEvents.rowDragLeft,
      gridEvents.rowDragEnd,
      gridEvents.rowDragMoved,
      gridEvents.rowDragEnd,
      gridEvents.doubleClickView,
    ],
    columnOrder: ['id', 'role_number', 'role_name', 'asset_serial_number'],
    omittedColumns: [
      'role_exists',
      'role_missing_from_registry',
      'project_id',
      'asset_exists',
      'asset_missing_from_registry',
      'full_path',
      'parent_changed',
      'role_changed',
    ],
    autoGroupColumnDef: {
      resizable: true,
      width: 400,
      rowDrag: true,
      headerName: 'Role Number',
      cellRendererParams: {
        aliasColumn: 'role_number',
        checkbox: true,
        innerRendererFramework: agComponents.AliasCell,
        suppressCount: true,
      },
      cellClassRules: {
        'hover-over': (params: MergeContext<ICellRendererParams>) =>
          params.node === params.context.vueStore.grid.potentialParent,
        ...roleClassRules,
      },
    },
    rowClassRules: {
      'background-grey': (params: RowStyleParams) => {
        // if entity's project id isn't the active one
        if (params.data) {
          return (
            params.context.vueStore.auth.activeProjectData.id !==
            params.data.project_id
          );
        }
        return false;
      },

      'text-grey': (params: RowStyleParams) => {
        // if project id is off or role does not exist
        if (params.data)
          return (
            !params.data.role_exists ||
            params.context.vueStore.auth.activeProjectData.id !==
              params.data.project_id
          );
        return false;
      },
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
        cellClassRules: roleClassRules,
      },
      {
        field: 'role_name',
        cellClassRules: roleClassRules,
      },
      {
        field: 'asset_id',
        hide: true,
        showInForm: false,
      },
      {
        field: 'asset_serial_number',
        cellType: CellType.rearrangeCell,
        showInForm: false,
        showInView: true,
        headerClass: 'asset-separator',
        cellClass: 'asset-separator',
        cellClassRules: assetClassRules,
      },
      {
        field: 'parent',
        hide: true,
        showInForm: false,
      },
    ],
  };

  private unassignedConfig: GridConfiguration = {
    gridType: 'normal',
    toolbarItems: [
      toolbarItems.addRow,
      toolbarItems.copyRow,
      toolbarItems.removeRow,
    ],
    title: 'Assets Without a Role',
    tableName: 'unassigned_assets',
    gridEvents: [gridEvents.onDropAsset, gridEvents.dragOver],
    overrideColumnDefinitions: [
      {
        field: 'asset_serial_number',
        headerName: 'Asset Serial Number',
        cellClassRules: {
          'background-green': ({ data }) =>
            data ? data.asset_missing_from_registry : false,
        } as ClassRules,
        cellType: CellType.rearrangeCell,
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
    gridEvents: [gridEvents.dragEndOrphanage, gridEvents.dragOver],
    treeData: true,
    getDataPath: (data) => data.full_path.split('.'),
    columnOrder: ['id', 'role_number', 'role_name', 'asset_serial_number'],
    toolbarItems: [toolbarItems.fitColumns, toolbarItems.sizeColumns],
    omittedColumns: [
      'id',
      'asset_id',
      'project_id',
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
    autoGroupColumnDef: {
      resizable: true,
      width: 400,
      headerName: 'Role Number',
      cellRendererParams: {
        aliasColumn: 'role_number',
        innerRendererFramework: agComponents.AliasCell,
        childCount: false,
      },
    },
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
</style>
