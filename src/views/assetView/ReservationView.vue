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
      toolbarItems.collapseAll,
      toolbarItems.fitColumns,
      toolbarItems.sizeColumns,
    ],
    columnOrder: ['role_name', 'reserved'],
    omittedColumns: ['id', 'role_number', 'full_path', 'parent', 'dummy'],
    treeData: true,
    getDataPath: (data) => data.full_path.split('.'),
    contextMenu: [],
    autoGroupColumnDef: {
      width: 400,
      cellRendererParams: {
        aliasColumn: 'role_number',
        innerRendererFramework: agComponents.AliasCell,
      },
    },
    overrideColumnDefinitions: [
      {
        field: 'approved',
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