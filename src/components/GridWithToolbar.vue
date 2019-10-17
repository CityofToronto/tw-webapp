<template>
  <div class="grid">
    <grid-toolbar
      :toolbar-items="internalConfig.toolbarItems"
      :grid-title="internalConfig.title"
      @toolbarClick="clickHandler"
    />
    <grid-component
      ref="gridComponent"
      :config="internalConfig"
      :query-type="'Direct'"
      @set-grid-instance="setGridInstance"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { RowNode } from 'ag-grid-community';
import { useStore } from 'vuex-simple';
import { getComponentProperties } from './grid/ts/GridTypes';
import Store from '@/store/store';

import RelationshipBuilder from './grid/RelationshipBuilder.vue';
import GridToolbar from './grid/GridToolbar.vue';
import GridInstance from './grid/ts/GridInstance';
import { GridComponentOptions, GridType, RowData } from '@/types/grid';
import { GRID_CONFIG } from '@/config';
import { GridConfiguration } from '@/types/config';
import TreeGrid from './grid/TreeGrid.vue';
import { ToolbarFunction } from './grid/ts/toolbarItems';
import GridComponent from './grid/GridComponent.vue';

@Component({
  components: {
    GridToolbar,
    GridComponent,
    RelationshipBuilder,
  },
})
export default class GridWithToolbar extends Vue {
  @Prop({ required: true, type: String }) readonly configKey!: string;

  @Prop(Object) readonly config!: GridConfiguration;

  internalConfig!: GridConfiguration;

  gridInstance!: GridInstance;

  store: Store = useStore(this.$store);

  created() {
    // Configuration passed down by props

    this.internalConfig = {
      tableName: this.configKey,
      title: this.configKey,
      ...GRID_CONFIG.get(this.configKey),
      ...this.config,
      tableID: this.configKey,
    };
  }

  clickHandler(clickFunction: ToolbarFunction): void {
    if (this.store && this.gridInstance) {
      clickFunction({
        gridInstance: this.gridInstance,
        vueStore: this.store,
      });
    } else {
      console.warn('Store or GridInstance is not initialized!');
    }
  }

  togglePanel() {
    this.store.display.toggleReviewPanel();
  }

  setGridInstance(gridInstance: GridInstance) {
    this.gridInstance = gridInstance;
  }
}
</script>

<style lang="scss">
@import '../../node_modules/ag-grid-community/dist/styles/ag-grid.css';
@import '../../node_modules/ag-grid-community/dist/styles/ag-theme-material.css';

$grid-size: 4px;
$icon-size: 12px;
$virtual-item-height: 5px;

.grid {
  height: 100%;
}

.thin-column {
  margin: auto !important;
  overflow: visible !important;
  padding: 0px 0px !important;
}

// Adds a border left of the ag-grid sidebar
.ag-theme-material .ag-side-bar {
  border-left-width: 0.5px;
  border-left-color: #e2e2e2;
}

// Styling for grid dropdown list
.ag-theme-material .ag-rich-select .ag-rich-select-list {
  height: auto !important;
  padding-bottom: 10px;
}
.ag-theme-material .ag-menu .ag-menu-separator {
  height: 8px;
}

.ag-theme-material .ag-header-cell-label {
  justify-content: center;
}

.ag-theme-material .ag-header-cell {
  padding-left: 12px;
  padding-right: 5px;
}

.ag-theme-material .ag-menu-option {
  height: 30px;
}
.ag-theme-material .ag-paging-panel {
  height: 45px !important;
}
.alert {
  margin: auto;
  width: 100%;
  top: 40%;
}

.hover-over {
  background-color: #e5e5ff;
}

.ag-theme-material .ag-cell-data-changed {
  background-color: #a5d6a7 !important;
}
.ag-theme-material .ag-cell-data-changed-animation {
  background-color: transparent;
  transition: background-color 1s;
}
</style>
