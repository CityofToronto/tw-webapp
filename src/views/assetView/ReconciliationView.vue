<template>
  <v-layout row wrap fill-height px-4 py-2>
    <v-flex md6 lg8>
      <v-sheet height="100%" elevation="2">
        <grid-with-toolbar :config="reconciliationConfig" />
      </v-sheet>
    </v-flex>
    <v-flex md6 lg4>
      <v-layout column fill-height>
        <v-flex xs6 px-2>
          <v-sheet height="100%" elevation="2">
            <grid-with-toolbar :config-key="'unassigned_assets'" />
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
import { ICellRendererParams } from 'ag-grid-community';
import { CellType, RowStyleParams, MergeContext } from '@/types/grid';

@Component({
  components: {
    GridWithToolbar,
  },
})
export default class ReconciliationView extends Vue {
  private reconciliationConfig: GridConfiguration = {
    tableName: 'reconciliation_view',
    title: 'Reconciliation',
    gridType: 'normal',
    treeData: true,
    suppressRowClickSelection: true,
    gridButtons: [gridButtons.addChildButton],
    toolbarItems: [
      toolbarItems.addRow,
      toolbarItems.expandAll,
      toolbarItems.collapseAll,
      toolbarItems.fitColumns,
      toolbarItems.sizeColumns,
    ],
    getDataPath: (data) => data.full_path.split('.'),
    gridEvents: [
      gridEvents.rowDragLeft,
      gridEvents.rowDragMoved,
      gridEvents.rowDragEnd,
    ],
    columnOrder: ['id', 'role_number', 'role_name', 'asset_serial_number'],
    omittedColumns: [
      'role_exists',
      'role_missing_from_registry',
      'project_id',
      'asset_exists',
      'asset_missing_from_registry',
      'full_path',
    ],
    autoGroupColumnDef: {
      resizable: true,
      rowDrag: true,
      width: 400,
      headerName: 'Role Number',
      cellRendererParams: {
        aliasColumn: 'role_number',
        checkbox: true,
        innerRendererFramework: agComponents.AliasCell,
      },
      cellClassRules: {
        'hover-over': (params: MergeContext<ICellRendererParams>) =>
          params.node === params.context.vueStore.grid.potentialParent,
      },
    },
    getRowStyle: (params: RowStyleParams) => {
      if (params.data) {
        if (!params.data.role_exists) {
          return { color: '#BDBDBD' };
        }
      }
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
        headerName: 'Role Number',
        hide: true,
      },
      {
        field: 'role_name',
        headerName: 'Role Name',
      },
      {
        field: 'asset_id',
        hide: true,
        showInForm: false,
      },
      {
        field: 'asset_serial_number',
        headerName: 'Asset Serial Number',
        cellType: CellType.rearrangeCell,
        showInForm: false,
      },
      {
        field: 'parent',
        hide: true,
        showInForm: true,
      },
    ],
  };

  private unassignedConfig: GridConfiguration = {
    gridType: 'normal',
    toolbarItems: [],
    title: 'Assets Without a Role',
    gridEvents: [gridEvents.onDropAsset, gridEvents.dragOver],
    overrideColumnDefinitions: [
      {
        field: 'asset_serial_number',
        headerName: 'Asset Serial Number',
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
    gridType: 'normal',
    toolbarItems: [],
    tableName: 'orphan',
  };
}
</script>
