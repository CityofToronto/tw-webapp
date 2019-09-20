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

// Config
import { GRID_CONFIG } from '@/config';
import { GridConfiguration } from '@/types/config';

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

  // Instance of ColumnApi, set during onGridReady
  columnApi!: ColumnApi;

  // Instance of GridApi, set during onGridReady
  gridApi!: GridApi;

  columnDefs: ColDef[] = [];

  // Wrapper of AgGrid
  gridInstance!: GridInstance;

  customColDefs: ColDef = {};

  context: { componentParent: object } = { componentParent: {} };

  gridOptions!: GridOptions;

  omittedColumns: string[] = [];

  config!: GridConfiguration;

  // This event is called after the grid is finished loading for the first time
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
      getRowNodeId: (data): string => data.id, //.toString(),
      ...this.config,
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
    this.gridInitializedEvent();
  }

  /**
   * Cell updates and call an async function to mutate the grid
   * If the mutation fails, cell value is reset and error message is shown
   */
  updateCellValue(
    node: RowNode,
    field: string,
    newData: any,
    oldValue: any,
  ): void {
    this.gridInstance.updateRows({
      rowsToUpdate: [newData],
      successCallback: (): void => {
        // Update row if successfull
        node.setData(newData);
      },
      failCallback: (): void => {
        // Revert row if failure
        node.setDataValue(field, oldValue);
      },
    });
  }

  cellValueChanged(event: CellValueChangedEvent): void {
    /**
     * This technically updates the entire row, but the rest of the row
     * has the old data. This was done to avoid implementing updateRow and updateCell
     * which were too similar to justify both.
     */
    this.updateCellValue(
      event.node,
      event.column.getColId(),
      event.data,
      event.oldValue,
    );
  }
}
