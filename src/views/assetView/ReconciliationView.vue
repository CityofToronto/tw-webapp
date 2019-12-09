<template>
  <v-layout row wrap fill-height px-4 py-2>
    <splitpanes>
      <pane min-size="33" size="67" style="padding: 2px;">
        <v-sheet height="100%" elevation="2">
          <grid-with-toolbar :config="reconciliationConfig" />
        </v-sheet>
      </pane>
      <pane min-size="23" size="37" style="padding: 2px;">
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
import { RowData } from '@/types/grid';
import { GridConfiguration } from '@/types/config';
import * as toolbarItems from '@/components/grid/ts/toolbarItems';
import { adoptBranch } from './common/orphanage';
import { useGridMixin } from '@/components/grid/ts/gridConfigMixin';

import {
  updateReconciliationConfig,
  unassignedConfigObject,
  orphanLikeConfig,
} from './common/tableConfigs';
import Store from '@/store/store';
import { useStore } from 'vuex-simple';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

const restoreFromTrash = toolbarItems.createToolbarItem(function(
  rowTransform: (row: RowData) => RowData,
) {
  return {
    text: 'Restore',
    icon: 'restore_from_trash',
    tooltip: 'Restore Item from Trash',
    clickFunction: () => {
      const rowsToRestore = this.gridInstance
        .getSelectedRows()
        .map(rowTransform);

      this.gridInstance.updateRows({
        rowsToUpdate: rowsToRestore,
      });
    },
  };
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

  private reconciliationConfig: GridConfiguration = useGridMixin(
    [
      {
        contextMenu: [adoptBranch(undefined, this.currentView)],
      },
    ],
    {
      ...updateReconciliationConfig(),
      title: 'Reconciliation',
      tableName: 'reconciliation_view',
    },
  );

  private unassignedConfig: GridConfiguration = {
    ...unassignedConfigObject,
    title: 'Assets Without a Role',
    tableName: 'unassigned_assets',
  };

  private orphanConfig: GridConfiguration = {
    ...orphanLikeConfig,
    title: 'Orphaned Roles',
    tableName: 'orphan_view',
  };

  private trashAssetConfig: GridConfiguration = {
    ...unassignedConfigObject,
    title: 'Deleted Assets',
    tableName: 'garbage_can_unassigned_assets',
    toolbarItems: [
      restoreFromTrash(undefined, (row) => ({ id: row.id, role_id: 0 })),
      toolbarItems.fitColumns(),
      toolbarItems.sizeColumns(),
    ],
    gridEvents: [],
  };

  private trashRoleConfig: GridConfiguration = {
    ...orphanLikeConfig,
    title: 'Deleted Roles',
    tableName: 'garbage_can_reconciliation_view',
    toolbarItems: [
      restoreFromTrash(undefined, (row) => ({ id: row.id, parent: 2 })),
      ...(orphanLikeConfig.toolbarItems ?? []),
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
  &--horizontal > &__splitter {
    min-height: 12px;
  }
  &--vertical > &__splitter {
    min-width: 8px;
  }
}
</style>
