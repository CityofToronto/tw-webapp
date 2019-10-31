import { Mutation, State, Action, Getter } from 'vuex-simple';
import GridInstance from '@/components/grid/ts/GridInstance';
import { RowNode, GridApi } from 'ag-grid-community';
import apolloClient from '@/apollo';
import gql from 'graphql-tag';
import { storeInstance } from '@/store';

export default class GridModule {
  @State() private potentialParentState!: RowNode | null;

  public constructor() {}

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
  public async subscribeToOrphanView() {
    apolloClient
      .subscribe({
        query: gql`
          subscription {
            orphan_view(where: { parent: { _eq: 2 } }) {
              id
              project_id
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .subscribe({
        next: ({ data }) => {
          this.setOrphanID(
            data.orphan_view
              // TODO remove this when jon implements project filtering
              .filter(
                (item: { id: string; project_id: number }) =>
                  item.project_id === storeInstance.auth.activeProjectData.id,
              )
              .map((item: { id: string }) => item.id),
          );
        },
      });
  }

  @Action()
  public forceFetchOrphanIDs() {
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
      .then(({ data }) => {
        this.orphanIDs = data.orphan_view
          // TODO remove this when jon implements project filtering
          .filter(
            (item: { id: string; project_id: number }) =>
              item.project_id === storeInstance.auth.activeProjectData.id,
          )
          .map((item: { id: string }) => item.id);
      });
  }
}
