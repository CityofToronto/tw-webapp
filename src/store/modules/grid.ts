import {
  Mutation, State, Action, Getter,
} from 'vuex-simple';

export default class DisplayModule {

  // This is the state of the 'main' table pulled from the URL
  @State() private table: {tableName: string; rowId: number}
  
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
  private setTableData(table: {tableName: string; rowId: number}): void {
    this.table = table;
  }

  @Action()
  public async pushTableData(table: {tableName: string; rowId: number}): Promise<void> {
    this.setTableData(table);
  }
};
  