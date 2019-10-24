import { Mutation, State, Action, Getter } from 'vuex-simple';
import GridInstance from '@/components/grid/ts/GridInstance';
import { RowNode, GridApi } from 'ag-grid-community';
import apolloClient from '@/apollo';
import gql from 'graphql-tag';
import { storeInstance } from '@/store';

export default class GridModule {
  // This is the state of the 'main' table pulled from the URL
  @State() private table: { tableName: string; rowId: number };

  @State() private potentialParentState!: RowNode | null;

  public constructor() {
    this.table = {
      tableName: 'activity',
      rowId: 45,
    };
  }

  @Getter()
  public get potentialParent() {
    return this.potentialParentState;
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
    let rowsToRefresh: RowNode[] = [];
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

  @Action()
  public async pushTableData(table: {
    tableName: string;
    rowId: number;
  }): Promise<void> {
    this.setTableData(table);
  }

  @State() private gridInstances: Map<string, GridInstance> = new Map();

  public getGridInstance(tableID: string): GridInstance | undefined {
    return this.gridInstances.get(tableID);
  }

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

  @Action()
  public forceUpdateAllGrids(): void {
    this.gridInstances.forEach((grid) => grid.forceUpdateData());
  }

  @State()
  private orphanIDs: string[] = [];

  @Getter()
  public get orphan() {
    return this.orphanIDs;
  }

  @Getter()
  public get orphanStatus() {
    return !!this.orphanIDs.length;
  }

  @Mutation()
  public setOrphanID(orphanID: string[]) {
    this.orphanIDs = orphanID;
  }

  @Action()
  public async fetchOrphanID() {
    apolloClient
      .query({
        query: gql`
          {
            orphan_view(where: { parent: { _eq: 2 } }) {
              id
              project_id
            }
          }
        `,
      })
      .then((response) => {
        console.log(response);
        this.orphanIDs = response.data.orphan_view
          .filter(
            (item: { id: string; project_id: number }) =>
              item.project_id === storeInstance.auth.activeProjectData.id,
          )
          .map((item: { id: string }) => item.id);
      });
  }
}
