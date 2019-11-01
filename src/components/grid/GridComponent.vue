<template>
  <div style="height: calc(100% - 48px);" v-on="events">
    <ag-grid-vue
      :style="
        config.autoHeight
          ? 'width: 100%;'
          : 'width: 100%; height: calc(100% - 48px);'
      "
      class="ag-theme-material"
      :dom-layout="config.autoHeight ? 'autoHeight' : 'normal'"
      :grid-options="gridOptions"
      :column-defs="columnDefs"
      :row-height="7 * 6"
      :header-height="7 * 7"
      :context="context"
      pagination-auto-page-size="true"
      @grid-ready="onGridReady"
      @cell-value-changed="cellValueChanged"
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
import { GridConfiguration, CustomProperties } from '@/types/config';
import {
  RequiredConfig,
  GridContext,
  MergeContext,
  FunctionProps,
} from '@/types/grid';
import { DirectProvider } from './ts/GridProviders';

// ag-Grid complains if you pass in extra keys to the grid options object, this function removes them
const removeInvalidProperties = (config: GridConfiguration): GridOptions => {
  const invalidProperties: CustomProperties[] = [
    'title',
    'omittedColumns',
    'contextMenu',
    'gridButtons',
    'overrideColumnDefinitions',
    'columnOrder',
    'gridType',
    'toolbarItems',
    'gridEvents',
    'tableName',
    'tableID',
    'gridInitializedEvent',
  ];

  return _.omit(config, invalidProperties);
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

  columnApi!: ColumnApi;

  gridApi!: GridApi;

  columnDefs: ColDef[] = [];

  gridInstance!: GridInstance;

  context: GridContext = {} as GridContext;

  sharedData: any = {};

  gridOptions!: GridOptions;

  events: { [p: string]: (e: any) => void } = {};

  /**
   * This event is called after the grid is finished loading for the first time.
   * It is fired when the onGridReady function is completed
   */
  gridInitializedEvent: (params: FunctionProps) => void = (): void => {};

  eventHandler<T>(
    event: T,
    eventFunction: Function,
    conditional: (...params: any[]) => boolean = () => false,
  ) {
    const functionParams = {
      event,
      gridInstance: this.gridInstance,
      vueStore: this.store,
    };
    if (!conditional(functionParams)) return;
    eventFunction(functionParams);
  }

  async created(): Promise<void> {
    // Mount events to the grid
    if (this.config.gridEvents) {
      this.config.gridEvents.forEach(
        (event) =>
          (this.events = {
            ...this.events,
            [event.type]: (e) =>
              this.eventHandler(e, event.callback, event.conditional),
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

  async onGridReady(params: AgGridEvent): Promise<void> {
    // Bind gridApi and columnApi
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    // Create gridInstance
    this.gridInstance = new GridInstance({
      columnApi: this.columnApi,
      gridApi: this.gridApi,
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
    this.gridApi.setRowData(await this.gridInstance.gridProvider.getData());

    // Set-up the subscription
    await this.gridInstance.subscribeToMore();

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
    } else {
      return ['copy', 'export'];
    }
  }

  /**
   * Cell updates and call an async function to mutate the grid
   * If the mutation fails, cell value is reset and error message is shown
   */
  cellValueChanged(event: CellValueChangedEvent): void {
    this.gridInstance
      .updateRows({
        rowsToUpdate: [event.data],
      })
      .catch(() => {
        event.node.setDataValue(event.column.getColId(), event.oldValue);
      });
  }
}
</script>
