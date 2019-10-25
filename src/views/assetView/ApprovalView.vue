<template>
  <v-layout row wrap fill-height px-4 py-2>
    <v-flex xs12>
      <v-sheet height="100%" elevation="2">
        <grid-with-toolbar :config="approvalConfig"></grid-with-toolbar>
      </v-sheet>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import GridWithToolbar from '@/components/GridWithToolbar.vue';

import { GridConfiguration } from '../../types/config';
import * as toolbarItems from '@/components/grid/ts/toolbarItems';
import agComponents from '@/components/grid/ag-components';
import { MergeContext } from '@/types/grid';
import { ICellRendererParams } from 'ag-grid-community';
import { createGridButton } from '@/components/grid/ts/ColumnFactory/gridButtons';
import { reservationRowStyle } from './common/rowStyles';

const approveButton = createGridButton({
  icon: (params) =>
    params.data.reserved && !params.data.approved && params.data.reservable
      ? 'check'
      : '',
  clickFunction: (params) => {
    const rowData = params.data;
    params.context.gridInstance.updateRows({
      rowsToUpdate: [
        {
          id: params.data.id,
          approved: true,
        },
      ],
    });
  },
});

const rejectButton = createGridButton({
  icon: (params) =>
    params.data.reserved && params.data.reservable && !params.data.approved
      ? 'close'
      : '',
  clickFunction: (params) => {
    params.context.gridInstance.updateRows({
      rowsToUpdate: [
        {
          id: params.data.id,
          approved: false,
        },
      ],
    });
  },
});

@Component({
  components: {
    GridWithToolbar,
  },
})
export default class ApprovalView extends Vue {
  private approvalConfig: GridConfiguration = {
    gridType: 'normal',
    tableName: 'reservation_view',
    title: 'Approval',
    toolbarItems: [
      toolbarItems.expandAll,
      toolbarItems.collapseAll,
      toolbarItems.fitColumns,
      toolbarItems.sizeColumns,
    ],
    omittedColumns: [
      'role_number',
      'full_path',
      'parent',
      'dummy',
      'reserved',
      'approved',
      'reservable',
    ],
    columnOrder: ['role_name', 'project_id', 'approval_status'],
    gridButtons: [rejectButton, approveButton],
    treeData: true,
    getDataPath: (data) => data.full_path.split('.'),
    autoGroupColumnDef: {
      resizable: true,
      headerName: 'Role Name',
      width: 400,
      cellRendererParams: {
        aliasColumn: 'role_number',
        innerRendererFramework: agComponents.AliasCell,
      },
    },
    getRowStyle: reservationRowStyle,
    overrideColumnDefinitions: [
      {
        field: 'id',
        hide: true,
      },
      {
        field: 'approval_status',
        headerName: 'Approval Status',
        filter: true,
      },
      {
        field: 'project_id',
        headerName: 'Reserved By (Project ID)',
      },
      {
        field: 'role_name',
        headerName: 'Role Name',
      },
    ],
  };
}
</script>
