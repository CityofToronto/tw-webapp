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
      toolbarItems.collapseAll,
      toolbarItems.fitColumns,
      toolbarItems.sizeColumns,
    ],
    omittedColumns: [
      'id',
      'role_number',
      'full_path',
      'parent',
      'dummy',
      'project_id',
    ],
    treeData: true,
    getDataPath: (data) => data.full_path.split('.'),
    autoGroupColumnDef: {
      width: 400,
      cellRendererParams: {
        aliasColumn: 'role_number',
        innerRendererFramework: agComponents.AliasCell,
      },
    },
    overrideColumnDefinitions: [
      {
        field: 'project_id',
        headerName: 'Reserved By (Project ID)',
      },
      {
        field: 'approved',
        cellStyle: { 'text-align': 'center' },
        cellRendererFramework: 'GridButton',
        cellRendererParams: {
          icon: (params: MergeContext<ICellRendererParams>) => {
            if (params.data.approved === true) {
              return 'check_box';
            }
            return 'check_box_outline_blank';
          },
          clickFunction: (params: MergeContext<ICellRendererParams>) => {
            if (params.data.approved && params.data.reserved) {
              const newData = {
                id: params.data.id,
                // reserved: false,
                approved: false,
              };
              params.context.vueStore.popup.setPopup({
                componentType: 'confirmation',
                message: `The reservation of this role has been approved.
                  Are you sure you want to unreserve it?`,
                popupTitle: 'Action Confirmation',
                confirmCallback: () => {
                  params.context.vueStore.popup.closePopup();
                  params.context.gridInstance.updateRows({
                    rowsToUpdate: [newData],
                  });
                },
              });
            } else if (!params.data.approved && params.data.reserved) {
              params.context.gridInstance.updateRows({
                rowsToUpdate: [
                  {
                    id: params.data.id,
                    approved: true,
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
