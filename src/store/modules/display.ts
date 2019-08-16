import {
  Mutation, State, Action, Getter,
} from 'vuex-simple';

export default class DisplayModule {
  // Review Panel State
  @State() private reviewPanel: boolean;

  private constructor() {
    this.reviewPanel = false;
    this.table = {
      tableName: 'activity',
      rowId: 45,
    };
  }

  @Getter()
  public get reviewPanelState(): boolean {
    return this.reviewPanel;
  }

  @Mutation()
  private togglePanel(): void {
    this.reviewPanel = !this.reviewPanel;
  }

  @Action()
  public async toggleReviewPanel(): Promise<void> {
    this.togglePanel();
  }

  // This is the state of the 'main' table pulled from the URL
  @State() private table: {tableName: string; rowId: number}

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
