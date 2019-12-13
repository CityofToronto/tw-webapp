import { RowData, RequiredConfig } from '@/types/grid';
import apolloClient from '@/apollo';
import GridInstance from '../GridInstance';

export default abstract class BaseGridProvider {
  protected tableName: string;
  protected tableID: string;
  public columnNames!: string[];
  protected subscription!: ZenObservable.Subscription;
  protected config: RequiredConfig;

  constructor(config: RequiredConfig) {
    this.config = config;
    this.tableName = config.tableName;
    this.tableID = config.tableID;
  }

  public unsubscribeFromData() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  protected async getColumnNames() {
    // If this is already defined, used the cached result
    if (this.columnNames) {
      return this.columnNames;
    }

    // If not, query hasura and map column names
    const columnObject = await apolloClient.getColumns(this.tableName);
    const columnNames = columnObject.map((col): string => col.name);

    this.columnNames = columnNames;
    return columnNames;
  }

  abstract async getData(): Promise<RowData[]>;

  abstract async subscribeToData(gridInstance: GridInstance): Promise<void>;

  abstract async addData(rowToAdd: { [key: string]: any }): Promise<RowData>;

  abstract async removeData(idToRemove: string): Promise<RowData>;

  abstract updateData(
    rowToUpdate: RowData,
    where?: [string, string | number],
  ): Promise<RowData>;
}
