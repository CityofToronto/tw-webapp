import {
  IServerSideGetRowsRequest,
  IServerSideDatasource,
  IServerSideGetRowsParams,
} from 'ag-grid-community';
import { RowData, GridDataTransformer, GridFilterModel } from '@/types/grid';
import GridAdapter from '../GridAdapter';

export default abstract class GridDatasource implements IServerSideDatasource {
  public constructor(
    tableName: string,
    customFilterModel: GridFilterModel,
    dataTransformer?: GridDataTransformer,
  ) {
    this.dataTransformer = dataTransformer;
    this.customFilterModel = customFilterModel;
    this.GridAdapter = new GridAdapter(tableName);
  }

  private dataTransformer: GridDataTransformer | undefined;

  private customFilterModel!: GridFilterModel;

  private gridRefreshEvent!: (...args: any) => void;

  public GridAdapter: GridAdapter;

  public setGridEvent(
    eventFunction: (rowData: RowData[], ...args: any) => void,
  ): void {
    this.gridRefreshEvent = eventFunction;
  }

  private callGridEvent(rowData: RowData[]): void {
    if (this.gridRefreshEvent) {
      this.gridRefreshEvent(rowData);
    }
  }

  // Return number of rows
  protected abstract countTotalRows(
    request?: IServerSideGetRowsRequest,
  ): Promise<number>;

  // Return table data
  protected abstract getData(
    request: IServerSideGetRowsRequest,
  ): Promise<RowData[]>;

  // Method to get numbers of rows and data
  public async getRows(params: IServerSideGetRowsParams): Promise<void> {
    params.request.filterModel = {
      ...params.request.filterModel,
      ...this.customFilterModel,
    };
    const numberOfRows = await this.countTotalRows(params.request);
    const rowData = await this.getData(params.request);

    let transformedData = rowData;
    if (typeof this.dataTransformer !== 'undefined') {
      // @ts-ignore
      transformedData = this.dataTransformer.transform(transformedData);
    }

    if (rowData) {
      params.successCallback(transformedData, numberOfRows);
      this.callGridEvent(rowData);
    } else {
      params.failCallback();
    }
  }
}
