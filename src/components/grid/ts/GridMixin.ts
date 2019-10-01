/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Vue, Component, Prop } from 'vue-property-decorator';
import ColumnDefiner from './ColumnDefiner';
import GridInstance from './GridInstance';
import { useStore } from 'vuex-simple';

// Types
import { QueryType } from '@/types/api';
import { GridDataTransformer } from '@/types/grid';
import {
  ColumnApi,
  GridApi,
  ColDef,
  GridOptions,
  AgGridEvent,
  CellValueChangedEvent,
  RowNode,
} from 'ag-grid-community';
import Store from '@/store/store';

// Components
import { AgGridVue } from 'ag-grid-vue';
import GridButton from '@/components/grid/ag-components/GridButton.vue';
import SetFilter from '../ag-components/SetFilter.vue';
import RearrangeRenderer from '../ag-components/RearrangeRenderer.vue';
import _ from 'lodash';

// Config
import { GRID_CONFIG } from '@/config';
import { GridConfiguration, CustomProperties } from '@/types/config';

// Remove invalid properties from the config file before passing it into Ag-Grid
const removeInvalidProperties = (config: GridConfiguration): GridOptions => {
  // TypeScript will give type errors when another property is added to the interface
  // It will need to be added here then
  const invalidProperties: CustomProperties[] = [
    'title',
    'omittedColumns',
    'columnButtons',
    'overrideColumnDefinitions',
    'customFilterModel',
    'columnOrder',
    'gridType',
    'onDropFunction',
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

  @Prop(Boolean) readonly pagination!: boolean;

  @Prop(Boolean) readonly editable!: boolean;

  @Prop(Boolean) readonly autoHeight!: boolean;

  @Prop(Boolean) readonly draggable!: boolean;

  @Prop(Boolean) readonly showSideBar!: boolean;

  @Prop(String) readonly tableName!: string;

  @Prop(String) readonly height!: string;

  store: Store = useStore(this.$store);

  dataTransformer!: GridDataTransformer;

  columnApi!: ColumnApi;

  gridApi!: GridApi;

  columnDefs: ColDef[] = [];

  gridInstance!: GridInstance;

  customColDefs: ColDef = {};

  context: { componentParent: object } = { componentParent: {} };

  gridOptions!: GridOptions;

  omittedColumns: string[] = [];

  config!: GridConfiguration;

  /**
   * This event is called after the grid is finished loading for the first time.
   * It is fired when the onGridReady function is completed
   */
  gridInitializedEvent: () => void = (): void => {};

  async created(): Promise<void> {
    this.config = GRID_CONFIG.get(this.tableName);

    this.omittedColumns = this.config
      ? this.config.omittedColumns
        ? this.config.omittedColumns
        : []
      : [];
    this.gridOptions = {
      sideBar: this.showSideBar,
      rowSelection: 'multiple',
      rowDeselection: true,
      rowModelType: 'serverSide',
      cacheBlockSize: 75,
      maxBlocksInCache: 5,
      getRowNodeId: (data): string => data.id,
      ...removeInvalidProperties(this.config),
    };

    this.context = {
      componentParent: this,
    };
  }

  async onGridReady(params: AgGridEvent): Promise<void> {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    const colDefiner = new ColumnDefiner(this.tableName);
    this.columnDefs = await colDefiner.getColumnDefs();

    this.gridInstance = new GridInstance({
      columnApi: this.columnApi,
      gridApi: this.gridApi,
      Provider: GridInstance.getProvider(
        this.queryType,
        this.tableName,
        this.config ? this.config.customFilterModel : {},
        // pass in a reference to VueX so that the datasource reacts with updates elsewhere
        this.store.grid,
        this.dataTransformer,
      ),
    });
    this.gridApi.setServerSideDatasource(this.gridInstance.gridDatasource);

    // Give grid instance to GridWithToolbar
    this.$emit('set-grid-instance', this.gridInstance);
    this.store.grid.setGridInstance({
      tableName: this.tableName,
      gridInstance: this.gridInstance,
    });
    this.gridInitializedEvent();
  }

  /**
   * Cell updates and call an async function to mutate the grid
   * If the mutation fails, cell value is reset and error message is shown
   */
  cellValueChanged(event: CellValueChangedEvent): void {
    /**
     * This technically updates the entire row, but the rest of the row
     * has the old data. This was done to avoid implementing updateRow and updateCell
     * which were too similar to justify both.
     */
    this.gridInstance.updateRows({
      rowsToUpdate: [event.data],
      successCallback: (): void => {
        //TODO
        // Update row if successful
        this.gridApi.flashCells({
          rowNodes: [event.node],
          columns: [event.column.getColId()],
        });
        event.node.setData(event.data);
      },
      failCallback: (): void => {
        // Revert row if failure
        event.node.setDataValue(event.column.getColId(), event.oldValue);
      },
    });
  }
}
