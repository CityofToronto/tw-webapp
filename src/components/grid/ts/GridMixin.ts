import { Vue, Component, Prop } from 'vue-property-decorator';
import ColumnFactory from './ColumnFactory';
import GridInstance from './GridInstance';
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
import SetFilter from '../ag-components/SetFilter.vue';
import RearrangeRenderer from '../ag-components/RearrangeRenderer.vue';
import _ from 'lodash';

// Config
import { GridConfiguration, CustomProperties } from '@/types/config';
import { RequiredConfig, GridContext, MergeContext } from '@/types/grid';

// Remove invalid properties from the config file before passing it into Ag-Grid
const removeInvalidProperties = (config: GridConfiguration): GridOptions => {
  // TypeScript will give type errors when another property is added to the interface
  // It will need to be added here then
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
  ];

  return _.omit(config, invalidProperties);
};

@Component({
  components: {
    AgGridVue,
    GridButton,
    SetFilter,
    RearrangeRenderer,
  },
})
export default class GridMixin extends Vue {
  @Prop(String) readonly queryType!: QueryType;

  @Prop({ required: true, type: Object }) readonly config!: RequiredConfig;

  store: Store = useStore(this.$store);

  columnApi!: ColumnApi;

  gridApi!: GridApi;

  columnDefs: ColDef[] = [];

  gridInstance!: GridInstance;

  context: GridContext = {} as GridContext;

  gridOptions!: GridOptions;

  events: { [p: string]: (e: any) => void } = {};

  /**
   * This event is called after the grid is finished loading for the first time.
   * It is fired when the onGridReady function is completed
   */
  gridInitializedEvent: () => void = (): void => {};

  eventHandler(event: any, eventFunction: Function) {
    eventFunction({
      event,
      gridInstance: this.gridInstance,
      vueStore: this.store,
    });
  }

  async created(): Promise<void> {
    if (this.config.gridEvents) {
      this.config.gridEvents.forEach(
        (event) =>
          (this.events = {
            ...this.events,
            [event.type]: (e) => this.eventHandler(e, event.callback),
          }),
      );
    }

    this.gridOptions = {
      rowSelection: 'multiple',
      rowDeselection: true,
      deltaRowDataMode: true,
      getContextMenuItems: this.getContextMenuItems,
      getRowNodeId: (data): string => data.id,
      // ag-Grid strip properties that don't exist in agGrid
      ...removeInvalidProperties(this.config),
    };
  }

  async onGridReady(params: AgGridEvent): Promise<void> {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.gridInstance = new GridInstance({
      columnApi: this.columnApi,
      gridApi: this.gridApi,
      gridOptions: this.gridOptions,
      gridProvider: GridInstance.getProvider(
        this.queryType,
        this.config,
        // pass in a reference to VueX so that the datasource reacts with updates elsewhere
        this.store.grid,
      ),
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
    this.gridInstance.subscribeToMore();

    // Give grid instance to GridWithToolbar
    this.$emit('set-grid-instance', this.gridInstance);
    this.store.grid.setGridInstance({
      tableID: this.config.tableID,
      gridInstance: this.gridInstance,
    });

    this.gridInitializedEvent();
  }

  getContextMenuItems(
    params: MergeContext<GetContextMenuItemsParams>,
  ): (MenuItemDef | string)[] {
    if (this.config.contextMenu) {
      const mappedMenu = this.config.contextMenu.map((item) => {
        if (typeof item === 'string') {
          return item;
        }
        return {
          ...item,
          name: typeof item.name === 'string' ? item.name : item.name(params),
          action: () => item.action(params),
        };
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
