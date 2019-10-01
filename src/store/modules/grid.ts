import { Mutation, State, Action, Getter } from 'vuex-simple';
import GridInstance from '@/components/grid/ts/GridInstance';

export default class GridModule {
  // This is the state of the 'main' table pulled from the URL
  @State() private table: { tableName: string; rowId: number };

  public constructor() {
    this.table = {
      tableName: 'activity',
      rowId: 45,
    };
  }

  @Getter()
  public get tableName(): string {
    return this.table.tableName;
  }

  @Getter()
  public get rowId(): number {
    return this.table.rowId;
  }

  @Mutation()
  private setTableData(table: { tableName: string; rowId: number }): void {
    this.table = table;
  }

  @Action()
  public async pushTableData(table: {
    tableName: string;
    rowId: number;
  }): Promise<void> {
    this.setTableData(table);
  }

  @State() private gridInstances: {
    [p: string]: GridInstance;
  } = {};

  @Getter()
  public get getGridInstance(): (
    tableName: string,
  ) => GridInstance | undefined {
    return (tableName: string) => {
      if (this.gridInstances[tableName]) {
        return this.gridInstances[tableName];
      }
      return undefined;
    };
  }

  @Mutation()
  public setGridInstance({
    tableName,
    gridInstance,
  }: {
    tableName: string;
    gridInstance: GridInstance;
  }): void {
    this.gridInstances[tableName] = gridInstance;
  }

  @Action()
  public refreshAllGridInstances() {
    Object.entries(this.gridInstances).forEach(([, gridInstance]) =>
      gridInstance.purgeCache(),
    );
  }

  @Action()
  public pushGridInstance(tableName: string, gridInstance: GridInstance): void {
    this.setGridInstance({ tableName, gridInstance });
  }
}
