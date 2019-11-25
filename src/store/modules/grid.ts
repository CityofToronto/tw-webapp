import { Mutation, State, Action, Getter } from 'vuex-simple';
import GridInstance from '@/components/grid/ts/GridInstance';
import { RowNode, GridApi } from '@ag-grid-enterprise/all-modules';

export default class GridModule {
  @State() private potentialParentState!: RowNode | null;

  @Getter()
  public get potentialParent() {
    return this.potentialParentState;
  }

  @Mutation()
  public setPotentialParent({
    parentNode,
    gridApi,
  }: {
    parentNode: RowNode | null;
    gridApi: GridApi;
  }) {
    let newPotentialParent: RowNode | null;
    if (parentNode) {
      newPotentialParent = parentNode;
    } else {
      newPotentialParent = null;
    }
    if (this.potentialParent === newPotentialParent) {
      return;
    }
    const rowsToRefresh: RowNode[] = [];
    if (this.potentialParent) {
      rowsToRefresh.push(this.potentialParent);
    }
    if (newPotentialParent) {
      rowsToRefresh.push(newPotentialParent);
    }
    this.potentialParentState = newPotentialParent;
    gridApi.refreshCells({
      rowNodes: rowsToRefresh,
      force: true,
    });
  }

  @State() private gridInstances: Map<string, GridInstance> = new Map();

  @Mutation()
  public setGridInstance({
    tableID,
    gridInstance,
  }: {
    tableID: string;
    gridInstance: GridInstance;
  }): void {
    this.gridInstances.set(tableID, gridInstance);
  }

  @Mutation()
  public removeGridInstance(tableID: string) {
    this.gridInstances.delete(tableID);
  }

  @Getter()
  public get getGridInstance(): (tableID: string) => GridInstance | undefined {
    return (tableID: string) => this.gridInstances.get(tableID);
  }

  /**
   * Force refresh all grids that are currently on screen.
   */
  @Action()
  public forceUpdateAllGrids(): void {
    this.gridInstances.forEach(
      (grid) => grid.rendered && grid.forceUpdateData(),
    );
  }
}
