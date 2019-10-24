<template>
  <v-layout row wrap fill-height px-4 py-2>
    <v-flex xs12>
      <v-sheet height="100%" elevation="2">
        <grid-with-toolbar :config="reservationConfig"></grid-with-toolbar>
      </v-sheet>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { GridConfiguration } from '@/types/config';
import { MergeContext, RowStyleParams } from '@/types/grid';
import * as toolbarItems from '@/components/grid/ts/toolbarItems';
import { ICellRendererParams } from 'ag-grid-community';
import GridWithToolbar from '@/components/GridWithToolbar.vue';
import agComponents from '@/components/grid/ag-components';

@Component({
  components: {
    GridWithToolbar,
  },
})
export default class ReservationView extends Vue {
  private reservationConfig: GridConfiguration = {
    gridType: 'normal',
    tableName: 'reservation_view',
    title: 'Reservation',
    toolbarItems: [
      toolbarItems.expandAll,
      toolbarItems.collapseAll,
      toolbarItems.fitColumns,
      toolbarItems.sizeColumns,
    ],
    columnOrder: ['role_name', 'reserved', 'project_id', 'approval_status'],
    omittedColumns: [
      'id',
      'role_number',
      'full_path',
      'parent',
      'dummy',
      'approved',
      'reservable',
    ],
    treeData: true,
    getDataPath: (data) => data.full_path.split('.'),
    contextMenu: [
      {
        icon: '<i class="material-icons">playlist_add_check</i>',
        name: 'Reserve Branch',
        action: (params) => {
          const rowsToUpdate = params.node.allLeafChildren
            .filter(({ data }) => !data.reserved)
            .map(({ data }) => ({
              id: data.id,
              reserved: true,
            }));
          params.context.gridInstance.updateRows({
            rowsToUpdate,
          });
        },
      },
    ],
    getRowStyle: (params: RowStyleParams) => {
      if (params.data) {
        if (
          params.context.vueStore.auth.activeProjectData.id !==
          params.data.project_id
        )
          return { background: '#eceff1' };
        if (params.data.approval_status === 'Pending')
          return { background: '#e0f7fa' };
        if (params.data.approval_status === 'Approved')
          return { background: '#e8f5e9' };
      }
      return false;
    },
    autoGroupColumnDef: {
      headerName: 'Role',
      width: 400,
      resizable: true,
      cellRendererParams: {
        aliasColumn: 'role_number',
        innerRendererFramework: agComponents.AliasCell,
      },
    },
    overrideColumnDefinitions: [
      {
        field: 'approval_status',
        headerName: 'Approval Status',
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
        field: 'reserved',
        cellStyle: { 'text-align': 'center' },
        cellRendererFramework: 'GridButton',
        /**
         * This defines the custom logic for the reservation button.
         * We set a dynamic checkbox icon, and a click function that
         * asks for confirmation if the asset is reserved and approved.
         */
        cellRendererParams: {
          icon: (params: MergeContext<ICellRendererParams>) => {
            // Show no icon if not reservable
            if (params.data.reservable) return '';
            if (params.data.reserved === true) {
              return 'check_box';
            }
            return 'check_box_outline_blank';
          },
          clickFunction: (params: MergeContext<ICellRendererParams>) => {
            if (params.data.approved && params.data.reserved) {
              const newData = {
                id: params.data.id,
                reserved: false,
              };
              params.context.vueStore.popup.setPopup({
                componentType: 'confirmation',
                message: `The reservation of this role has been approved.
                  Are you sure you want to unreserve it?
                  To reserve it again, it will need to be approved.`,
                popupTitle: 'Action Confirmation',
                confirmCallback: () => {
                  params.context.vueStore.popup.closePopup();
                  params.context.gridInstance.updateRows({
                    rowsToUpdate: [newData],
                  });
                },
              });
            } else {
              params.context.gridInstance.updateRows({
                rowsToUpdate: [
                  {
                    id: params.data.id,
                    reserved: !params.data.reserved,
                  },
                ],
              });
            }
          },
        },
      },
    ],
  };
}
</script>

<style lang="scss">
.ag-theme-material {
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
