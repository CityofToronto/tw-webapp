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
import { MergeContext } from '@/types/grid';
import * as toolbarItems from '@/components/grid/ts/toolbarItems';
import * as contextItems from '@/components/grid/ts/contextItems';
import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import GridWithToolbar from '@/components/GridWithToolbar.vue';
import { reservationRowStyle } from './common/cssStyles';
import { ContextMenuFunc } from '@/components/grid/ts/contextItems';
import { expandAndFit } from './common/mixins';
import { useGridMixin } from '@/components/grid/ts/gridConfigMixin';

const reserveBranchItem: ContextMenuFunc = (params) => ({
  icon: '<i class="material-icons">playlist_add_check</i>',
  name: 'Reserve Branch',
  action: () => {
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
});

@Component({
  components: {
    GridWithToolbar,
  },
})
export default class ReservationView extends Vue {
  private reservationConfig: GridConfiguration = useGridMixin([expandAndFit], {
    gridType: 'normal',
    tableName: 'reservation_view',
    title: 'Reservation',
    toolbarItems: [
      toolbarItems.collapseAll(),
      toolbarItems.fitColumns(),
      toolbarItems.sizeColumns(),
    ],
    treeData: true,
    getDataPath: (data) => data.full_path.split('.'),
    contextMenu: [contextItems.expandBranch(), reserveBranchItem],
    getRowStyle: reservationRowStyle,
    autoGroupColumnDef: {
      headerName: 'Role',
      width: 400,
      resizable: true,
      valueFormatter: ({ data }) => data.role_number,
      cellRendererParams: {
        suppressCount: true,
      },
    },
    overrideColumnDefinitions: [
      {
        field: 'id',
        hide: true,
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
            if (!params.data.reservable) return '';
            if (params.data.reserved) {
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
              this.$swal({
                type: 'info',
                title: 'Confirm Action!',
                text: `The reservation of this role has been approved.
                   Are you sure you want to unreserve it?
                   To reserve it again, it will need to be approved.`,
                showCancelButton: true,
              }).then((result) => {
                if (result.value) {
                  params.context.gridInstance.updateRows({
                    rowsToUpdate: [newData],
                  });
                }
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
      {
        field: 'project_id',
        headerName: 'Reserved By (Project ID)',
      },
      {
        field: 'approval_status',
        headerName: 'Approval Status',
      },
    ],
  });
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
