<template>
  <v-layout row wrap fill-height px-4 py-2>
    <splitpanes>
      <pane min-size="33" size="67" style="padding: 2px;">
        <v-sheet height="100%" elevation="2">
          <grid-with-toolbar :config="changeMainViewConfig" />
        </v-sheet>
      </pane>
      <pane min-size="23" size="37" style="padding: 2px;">
        <v-sheet height="100%" elevation="2">
          <splitpanes horizontal>
            <pane>
              <v-tabs v-model="tabState" right="" height="48">
                <v-tab>Unassigned</v-tab>
                <v-tab>Dumpster</v-tab>
              </v-tabs>
              <v-tabs-items v-model="tabState" style="height: 100%">
                <v-tab-item style="height: calc(100% - 48px)">
                  <grid-with-toolbar :config="trashAssetConfig" />
                </v-tab-item>
                <v-tab-item style="height: calc(100% - 48px)">
                  <grid-with-toolbar :config="dumpsterAssetConfig" />
                </v-tab-item>
              </v-tabs-items>
            </pane>
            <pane>
              <grid-with-toolbar :config="orphanedRoleConfig" />
            </pane>
          </splitpanes>
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
import { useGridMixin } from '@/components/grid/ts/gridConfigMixin';

import * as toolbarItems from '@/components/grid/ts/toolbarItems';
// import * as gridEvents from '@/components/grid/ts/gridEvents/';
// import * as gridButtons from '@/components/grid/ts/ColumnFactory/gridButtons';
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
export default class ChangeView extends Vue {
  // Define the VueX Store
  store: Store = useStore(this.$store);

  tabState: number | null = null;

  private changeMainViewConfig: GridConfiguration = {
    ...updateReconciliationConfig(),
    title: 'Update / Change',
    tableName: 'change_view',
  };

  private trashAssetConfig: GridConfiguration = {
    ...unassignedConfigObject,
    title: 'Assets Without a Role',
    tableName: 'change_unassigned_asset_view',
  };

  private dumpsterAssetConfig: GridConfiguration = {
    ...unassignedConfigObject,
    title: 'Dumpster Assets',
    tableName: 'dumpster_asset_view',
    toolbarItems: [
      restoreFromTrash(undefined, (row) => ({ id: row.id, role_id: 0 })),
      toolbarItems.fitColumns(),
      toolbarItems.sizeColumns(),
    ],
  };

  private orphanedRoleConfig: GridConfiguration = {
    ...orphanLikeConfig,
    title: 'Orphaned Roles',
    tableName: 'dumpster_change_view',
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
