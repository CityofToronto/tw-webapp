import {
  GridOptions, ColDef, GridApi, IServerSideGetRowsParams,
} from 'ag-grid-community';
import { countRows, getRows } from '../apollo';
import store from '@/store';

// A lot of this code just translates the agGrid params into something Hasura decipher
const setFilterModel = (gridApi, filterModel) => {
  Object.entries(filterModel).forEach(([key, value]) => {
    if (value.filterType === 'set') {
      const filter = gridApi.getFilterInstance(key);
      filter.valueModel.allUniqueValues.forEach((setValues) => {
        if (value.values.includes(setValues)) {
          filter.selectValue(setValues);
        } else {
          filter.unselectValue(setValues);
        }
      });
    }
  });
};

interface Options extends GridOptions {
  api: GridApi,
}

class ServerSideDatasource {
  gridOptions: GridOptions;

  columnDefs: ColDef[];

  tableName: string;

  relation: string;

  gridApi!: GridApi;

  constructor({
    gridOptions, tableName, relation, columnDefs,
  }:{gridOptions: Options; tableName: string; relation: string; columnDefs: ColDef[]}) {
    this.gridOptions = gridOptions;
    this.tableName = tableName;
    this.gridApi = gridOptions.api;
    this.columnDefs = columnDefs;
    this.relation = relation;
  }


  async getRows(params: IServerSideGetRowsParams) {
    setFilterModel(this.gridApi, params.request.filterModel);
    const columns = this.columnDefs;
    // First get the number of rows of the table
    const numberOfRows = await countRows({
      tableName: this.tableName,
      dependsOn: this.relation ? store.getters.getTableName : undefined,
      id: this.relation ? store.getters.getRowId : undefined,
      relationshipType: this.relation,
    });


    // Then query the table with variables

    const rowData = await getRows({
      tableName: this.tableName,
      request: params.request,
      columns,
      dependsOn: this.relation ? store.getters.getTableName : undefined,
      id: this.relation ? store.getters.getRowId : undefined,
      relationshipType: this.relation,
    });

    if (rowData) {
      params.successCallback(rowData, numberOfRows);
    } else {
      params.failCallback();
      // throw Error();
    }
  }
}

export default ServerSideDatasource;
