import { Mutation, State, Action, Getter } from 'vuex-simple';

export default class DisplayModule {
  // Review Panel State
  @State() private reviewPanel: boolean;

  public constructor() {
    this.reviewPanel = false;
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
}
