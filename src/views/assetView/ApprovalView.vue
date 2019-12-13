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
import * as toolbarItems from '@/components/grid/ts/toolbarItems';
import * as contextItems from '@/components/grid/ts/contextItems';
import agComponents from '@/components/grid/ag-components';
import { GridConfiguration } from '@/types/config';
import { createGridButton } from '@/components/grid/ts/ColumnFactory/gridButtons';
import { reservationRowStyle } from './common/cssStyles';
import { isCurrentProject } from './common/conditionals';
import { expandAndFit } from './common/mixins';
import { useGridMixin } from '@/components/grid/ts/gridConfigMixin';

/**
 * Creates a custom grid button (approveButton)
 * This is disabled if the asset is reserved, approved or not reservable
 * It displays a check mark that commits an approval on the entity
 */
const approveButton = createGridButton(
  {
    icon: (params) =>
      params.data.reserved &&
      !params.data.approved &&
      params.data.reservable &&
      isCurrentProject(params.data.project_id)
        ? 'check'
        : '',
    clickFunction: (params) => {
      params.context.gridInstance.updateRows({
        rowsToUpdate: [
          {
            id: params.data.id,
            approved: true,
          },
        ],
      });
    },
  },
  'reserved',
);

/**
 * Creates a custom grid button (rejectButton)
 * This is disabled if the asset is reserved, not reservable or approved
 * It appears when a reservation is pending on the user's current project
 * It displays a X that commits an unapproved action
 */
const rejectButton = createGridButton(
  {
    icon: (params) =>
      params.data.reserved &&
      params.data.reservable &&
      !params.data.approved &&
      isCurrentProject(params.data.project_id)
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
  },
  'reserved',
);

@Component({
  components: {
    GridWithToolbar,
  },
})
export default class ApprovalView extends Vue {
  private approvalConfig: GridConfiguration = useGridMixin([expandAndFit], {
    gridType: 'normal',
    tableName: 'reservation_view',
    tableID: 'approval_view',
    title: 'Approval',
    toolbarItems: [
      // register our toolbar items
      toolbarItems.collapseAll(),
      toolbarItems.fitColumns(),
      toolbarItems.sizeColumns(),
    ],
    contextMenu: [contextItems.expandBranch()],
    gridButtons: [rejectButton, approveButton], // register our buttons
    treeData: true,
    getDataPath: (data) => data.full_path.split('.'),
    autoGroupColumnDef: {
      resizable: true,
      headerName: 'Role Name',
      valueFormatter: ({ data }) => data.role_number,
      width: 400,
      cellRendererParams: {
        suppressCount: true,
      },
    },
    getRowStyle: reservationRowStyle, // apply same style as reservation page
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
      {
        field: 'role_name',
        headerName: 'Role Name2',
      },
    ],
  });
}
</script>
