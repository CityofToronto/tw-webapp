import { RowData } from '@/types/grid';
import GridDatasource from '../Datasources/GridDatasource';
import apolloClient from '@/apollo';

const isTreeData = (columnNames: string[]): boolean => {
  return columnNames.includes('parent');
};

export default abstract class BaseGridProvider {
  public abstract gridDatasource: GridDatasource;
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected async getColumnNames() {
    const columnObject = await apolloClient.getColumns(this.tableName);
    const columnNames = columnObject.map((col): string => col.name);

    if (isTreeData(columnNames)) {
      columnNames.push(`children_aggregate { aggregate { count }}`);
    }
    return columnNames;
  }

  abstract async getData(): Promise<RowData[]>;

  abstract addData(
    rowToAdd: { [key: string]: any },
    successCallback?: () => void,
    failCallBack?: () => void,
  ): Promise<RowData>;

  /** Function to remove a row from source */
  abstract removeData(
    idToRemove: string,
    successCallback?: () => void,
    failCallBack?: () => void,
  ): Promise<RowData>;

  /**
   * In the case of MTM, updating data is not supported as
   * it would unexpectedly affect others.
   */
  abstract updateData(
    rowToUpdate: RowData,
    successCallback?: () => void,
    failCallBack?: () => void,
  ): Promise<RowData>;
}
