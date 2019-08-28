/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { AgGridVue } from 'ag-grid-vue';
import { Vue, Component, Prop } from 'vue-property-decorator';
import { ColumnApi, GridApi, AgGridEvent, ColDef, GridOptions } from 'ag-grid-community';
import { useStore } from 'vuex-simple';
import GridButton from '@/components/grid/ag-components/GridButton.vue';
import GridInstance from './GridInstance';
import { ColumnDefiner } from './ColumnDefiner';
import Store from '@/store/store';
import * as GRID_CONFIG from '../ts/grid.config';
import { QueryType } from '@/types/api';
import { CustomColumn } from '@/types/grid';

@Component({
  components: {
    AgGridVue,
    GridButton,
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

  // Array and Object Props must return a function that returns the default value
  @Prop({ default: (): [] => [] }) readonly customColumns!: CustomColumn[];

  store: Store = useStore(this.$store);

  columnApi!: ColumnApi;

  gridApi!: GridApi;

  columnDefs: ColDef[] = [];

  gridInstance!: GridInstance;

  context: { componentParent: object } = { componentParent: {} };

  gridOptions!: GridOptions;

  async created(): Promise<void> {
    this.gridOptions = {
      sideBar: this.showSideBar,
      rowSelection: 'multiple',
      rowDeselection: true,
      rowModelType: GRID_CONFIG.rowModelType,
      cacheBlockSize: GRID_CONFIG.cacheBlockSize,
      maxBlocksInCache: GRID_CONFIG.maxBlocksInCache,
    };

    this.context = {
      componentParent: this,
    };
  }

  async onGridReady(params: AgGridEvent): Promise<void> {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    const colDefiner = new ColumnDefiner(this.tableName, this.editable, this.customColumns);
    this.columnDefs = await colDefiner.getColumnDefs();

    this.gridInstance = new GridInstance({
      columnApi: this.columnApi,
      gridApi: this.gridApi,
      Provider: GridInstance.getProvider(
        this.queryType,
        this.tableName,
        // pass in a reference to VueX so that the datasource reacts with updates elsewhere
        this.store.grid,
      ),
    });
    this.gridApi.setServerSideDatasource(this.gridInstance.gridDatasource);

    // Give grid instance to GridWithToolbar
    this.$emit('set-grid-instance', this.gridInstance);
  }
}
