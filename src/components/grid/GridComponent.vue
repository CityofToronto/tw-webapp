<template>
  <div style="height: calc(100% - 48px);" v-on="events">
    <ag-grid-vue
      :style="config.autoHeight ? 'width: 100%;' : 'width: 100%; height: 100%;'"
      class="ag-theme-material"
      :dom-layout="config.autoHeight ? 'autoHeight' : 'normal'"
      :grid-options="gridOptions"
      :column-defs="columnDefs"
      :context="context"
      :row-height="7 * 6"
      :header-height="7 * 7"
      @grid-ready="onGridReady"
      v-on="events"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Watch, Component, Prop } from 'vue-property-decorator';
import { RowEvent, RowNode } from 'ag-grid-community';
import TreeviewEditor from './ag-components/TreeviewEditor.vue';
import TreeviewRenderer from './ag-components/TreeviewRenderer.vue';
import TreeviewFilter from './ag-components/TreeviewFilter.vue';
import RearrangeRenderer from './ag-components/RearrangeRenderer.vue';

import ColumnFactory from './ts/ColumnFactory';
import GridInstance from './ts/GridInstance';
import { useStore } from 'vuex-simple';

// Types
import { QueryType } from '@/types/api';
import {
  ColumnApi,
  GridApi,
  ColDef,
  GridOptions,
  AgGridEvent,
  CellValueChangedEvent,
  GetContextMenuItemsParams,
  MenuItemDef,
} from 'ag-grid-community';
import Store from '@/store/store';

// Components
import { AgGridVue } from 'ag-grid-vue';
import GridButton from '@/components/grid/ag-components/GridButton.vue';
import SetFilter from './ag-components/SetFilter.vue';
import _ from 'lodash';

// Config
import {
  GridConfiguration,
  CustomProperties,
  CustomColGroupDef,
} from '@/types/config';
import {
  RequiredConfig,
  GridContext,
  MergeContext,
  FunctionProps,
} from '@/types/grid';
import { DirectProvider } from './ts/GridProviders';

// ag-Grid complains if you pass in extra keys to the grid options object, this function removes them
const removeInvalidProperties = (config: GridConfiguration): GridOptions => {
  const invalidProperties: CustomProperties = {
    title: true,
    contextMenu: true,
    gridButtons: true,
    overrideColumnDefinitions: true,
    columnOrder: true,
    gridType: true,
    toolbarItems: true,
    gridEvents: true,
    tableName: true,
    tableID: true,
    gridInitializedEvent: true,
  };

  return _.omit(config, Object.keys(invalidProperties));
};

// TODO Figure out a better way of loading in additional components since these get loaded even if they aren't used
@Component({
  components: {
    AgGridVue,
    GridButton,
    SetFilter,
    RearrangeRenderer,
    TreeviewEditor,
    TreeviewRenderer,
    TreeviewFilter,
  },
})
export default class GridComponent extends Vue {
  @Prop({ required: true, type: Object }) readonly config!: RequiredConfig;

  store: Store = useStore(this.$store);

  columnDefs: (ColDef | CustomColGroupDef)[] = [];

  gridInstance!: GridInstance;

  context: GridContext = {} as GridContext;

  gridOptions!: GridOptions;

  events: { [p: string]: (e: any) => void } = {};

  /**
   * This event is called after the grid is finished loading for the first time.
   * It is fired when the onGridReady function is completed
   */
  eventHandler<T>(event: T, eventFunction: Function) {
    const functionParams = {
      event,
      gridInstance: this.gridInstance,
      vueStore: this.store,
    };
    eventFunction(functionParams).callback();
  }

  async created(): Promise<void> {
    // Mount events to the grid
    const functionParams = {
      event,
      gridInstance: this.gridInstance,
      vueStore: this.store,
    };

    if (this.config.gridEvents) {
      this.config.gridEvents.forEach(
        (event) =>
          (this.events = {
            ...this.events,
            [event(functionParams).type]: (e) => this.eventHandler(e, event),
          }),
      );
    }

    // Merge configuration object with pre-defined keys
    this.gridOptions = {
      rowSelection: 'multiple',
      rowDeselection: true,
      deltaRowDataMode: true,
      getContextMenuItems: this.getContextMenuItems,
      getRowNodeId: (data): string => data.id,
      // Strip properties that don't exist in agGrid
      ...removeInvalidProperties(this.config),
    };
  }

  async onGridReady({ api, columnApi }: AgGridEvent): Promise<void> {
    // Create gridInstance
    this.gridInstance = new GridInstance({
      columnApi,
      gridApi: api,
      gridOptions: this.gridOptions,
      gridProvider: new DirectProvider(this.config),
    });

    // Set context for ag grid components to use
    this.context = {
      gridInstance: this.gridInstance,
      vueStore: this.store,
      parentComponent: this,
    };

    // Get the column properties
    this.columnDefs = await new ColumnFactory(this.config).getColumnDefs();

    // Get initial data and load the grid with it
    api.setRowData(await this.gridInstance.gridProvider.getData());

    // Set-up the subscription
    //this.gridInstance.subscribeToMore();

    // Give grid instance to GridWithToolbar and the store
    this.$emit('set-grid-instance', this.gridInstance);
    this.store.grid.setGridInstance({
      tableID: this.config.tableID,
      gridInstance: this.gridInstance,
    });

    // Trigger custom event
    if (this.config.gridInitializedEvent) {
      this.config.gridInitializedEvent({
        gridInstance: this.gridInstance,
        vueStore: this.store,
      });
    }
  }

  beforeDestroy() {
    this.store.grid.removeGridInstance(this.config.tableID);
  }

  // This callback is run whenever a right click happens
  // Populate the right context menu
  getContextMenuItems(
    params: MergeContext<GetContextMenuItemsParams>,
  ): (MenuItemDef | string)[] {
    if (this.config.contextMenu) {
      const mappedMenu = this.config.contextMenu.map((item) => {
        if (typeof item === 'string') {
          return item;
        }
        return item(params);
      });
      return ['copy', 'export', 'separator', ...mappedMenu];
    }
    return ['copy', 'export'];
  }
}
</script>

<style lang="scss">
$grid-size: 7px;
$icon-size: 18px;

@import '../../../node_modules/ag-grid-community/src/styles/ag-grid.scss';
@import '../../../node_modules/ag-grid-community/src/styles/ag-theme-material/sass/ag-theme-material.scss';
</style>
