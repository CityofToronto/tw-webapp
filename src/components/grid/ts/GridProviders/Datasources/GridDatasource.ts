import {
  IServerSideGetRowsRequest,
  IServerSideDatasource,
  IServerSideGetRowsParams,
} from 'ag-grid-community';
import { RowData, GridDataTransformer } from '@/types/grid';
import GridAdapter from '../GridAdapter';

export default abstract class GridDatasource implements IServerSideDatasource {
  public constructor(dataTransformer?: GridDataTransformer, tableName: string) {
    this.dataTransformer = dataTransformer;
    this.GridAdapter = new GridAdapter(tableName);
  }

  private dataTransformer: GridDataTransformer | undefined;

  public GridAdapter: GridAdapter;

  protected abstract countTotalRows(request?: IServerSideGetRowsRequest): Promise<number>;

  protected abstract getData(request: IServerSideGetRowsRequest): Promise<RowData[]>;

  public async getRows(params: IServerSideGetRowsParams): Promise<void> {
    const numberOfRows = await this.countTotalRows(params.request);
    const rowData = await this.getData(params.request);

    let transformedData = rowData;
    if (typeof this.dataTransformer !== 'undefined') {
      transformedData = this.dataTransformer.transform(transformedData)
    }

    if (rowData) {
      params.successCallback(transformedData, numberOfRows);
    } else {
      params.failCallback();
    }
  }
}
