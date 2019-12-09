<template>
  <div class="grid">
    <grid-toolbar
      :toolbar-items="internalConfig.toolbarItems"
      :grid-title="internalConfig.title"
      :grid-instance="gridInstance"
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
import { useStore } from 'vuex-simple';
import Store from '@/store/store';

import RelationshipBuilder from './grid/RelationshipBuilder.vue';
import GridToolbar from './grid/GridToolbar.vue';
import GridInstance from './grid/ts/GridInstance';
import { GridConfiguration } from '@/types/config';
import GridComponent from './grid/GridComponent.vue';

@Component({
  components: {
    GridToolbar,
    GridComponent,
    RelationshipBuilder,
  },
})
export default class GridWithToolbar extends Vue {
  @Prop({ required: false, type: String }) readonly configKey!: string;

  @Prop(Object) readonly config!: GridConfiguration;

  internalConfig!: GridConfiguration;

  gridInstance: GridInstance = {} as GridInstance;

  store: Store = useStore(this.$store);

  created() {
    // Configuration passed down by props
    this.internalConfig = {
      tableName: this.configKey,
      title: this.configKey,
      ...this.config,
    };
    this.internalConfig.tableID = this.config?.tableID
      ? this.config.tableID
      : this.config.tableName;
  }

  togglePanel() {
    this.store.display.toggleReviewPanel();
  }

  setGridInstance(gridInstance: GridInstance) {
    this.gridInstance = gridInstance;
  }

  activated() {
    this.gridInstance.rendered = true;
  }

  deactivated() {
    this.gridInstance.rendered = false;
  }
}
</script>

<style lang="scss">
.grid {
  height: 100%;
}

.thin-column {
  margin: auto !important;
  overflow: visible !important;
  padding: 0px 0px !important;
  text-align: center;
}

// Adds a border left of the ag-grid sidebar
.ag-theme-material {
  .ag-status-bar {
    display: none;
  }
  .ag-side-bar {
    border-left-width: 0.5px;
    border-left-color: #e2e2e2;
  }

  .ag-header-group-cell-label {
    justify-content: center;
  }
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
  background-color: #e5e5ff !important;
}

.ag-theme-material .ag-cell-data-changed {
  background-color: #a5d6a7 !important;
}
.ag-theme-material .ag-cell-data-changed-animation {
  background-color: transparent;
  transition: background-color 1s;
}
</style>
