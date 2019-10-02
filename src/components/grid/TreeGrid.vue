/* eslint-disable vue/no-parsing-error */ /* eslint-disable vue/valid-v-bind */
<template>
  <ag-grid-vue
    :style="
      autoHeight ? 'width: 100%;' : 'width: 100%; height: calc(100% - 48px);'
    "
    class="ag-theme-material"
    :dom-layout="autoHeight ? 'autoHeight' : 'normal'"
    :grid-options="gridOptions"
    :column-defs="columnDefs"
    :row-height="7 * 6"
    :header-height="7 * 7"
    :context="context"
    :animate-rows="true"
    :pagination="pagination"
    :pagination-auto-page-size="true"
    @grid-ready="onGridReady"
    @row-drag-move="onRowDragMove"
    @row-drag-end="onRowDragEnd"
    @row-drag-leave="onRowDragLeave"
    @row-group-opened="onGroupOpened"
    @cell-value-changed="cellValueChanged"
  />
</template>

<script lang="ts">
import {
  RowDragEnterEvent,
  RowDragMoveEvent,
  RowNode,
  ICellRendererParams,
  RowGroupOpenedEvent,
  RowDragEvent,
} from 'ag-grid-community';
import { Component, Mixins } from 'vue-property-decorator';
import GridMixin from './ts/GridMixin';
import { RowData } from '@/types/grid';
import TreeTransformer from './ts/GridProviders/GridTransformer/TreeTransformer';
import AliasCell from '@/components/grid/ag-components/AliasCell.vue';

@Component({
  components: {
    AliasCell,
  },
})
export default class TreeGridComponent extends Mixins(GridMixin) {
  potentialParent!: RowNode | null;

  openRowGroups: string[] = [];

  async created() {
    this.customColDefs = {
      cellClassRules: {
        'hover-over': (params: ICellRendererParams) =>
          params.node === this.potentialParent,
      },
    };

    this.gridInitializedEvent = () => {
      this.gridInstance.setGridUpdateEvent((rowData: RowData[]) => {
        rowData
          .filter((row): boolean => this.openRowGroups.includes(row.id))
          .forEach((row) => {
            this.gridApi.getRowNode(row.id).setExpanded(true);
          });
      });
    };

    this.dataTransformer = new TreeTransformer();
    this.gridOptions = {
      ...this.gridOptions,
      groupSelectsChildren: false,
      treeData: true,
      // dataItem.group is populated in the TreeTransformer
      // boolean to show whether or not there are children
      isServerSideGroup: (dataItem): boolean => dataItem.group,
      // What column to group by, here it is the id column as it should
      // always be present in the data
      getServerSideGroupKey: (dataItem): string => `${dataItem.id}`,
      suppressRowClickSelection: true,
      autoGroupColumnDef: {
        resizable: true,
        rowDrag: true,
        width: 400,
        cellRendererParams: {
          aliasColumn: 'role_number', //TODO move to config
          checkbox: true,
          innerRendererFramework: AliasCell,
        },
        cellClassRules: {
          'hover-over': (params: ICellRendererParams) =>
            params.node === this.potentialParent,
        },
      },
    };
  }

  onRowDragMove(event: RowDragMoveEvent) {
    this.setPotentialParent(event.overNode);
  }

  onRowDragLeave() {
    // Remove all highlighting when drag leaves the grid
    this.setPotentialParent(null);
  }

  onRowDragEnd(event: RowDragEvent) {
    const rowToMove = event.node.data;
    const newParentId = event.overNode ? event.overNode.data.id : null;
    if (newParentId === rowToMove.id) {
      return;
    }

    const newData = {
      id: rowToMove.id,
      parent: newParentId,
    };
    this.gridInstance.updateRows({
      rowsToUpdate: [newData],
      successCallback: () => {
        this.onGroupOpened(event);
        this.gridInstance.purgeCache();
      },
    });
  }

  // Collapse all nodes in the openRowGroups array
  collapseAll() {
    this.openRowGroups.forEach((rowId) =>
      this.gridApi.getRowNode(rowId).setExpanded(false),
    );
  }

  onGroupOpened(event: RowDragEvent) {
    const idOpened = event.node.id;
    // If it is present, remove it, if not add it
    if (!event.node.expanded) {
      this.openRowGroups = this.openRowGroups.filter(
        (item) => item !== idOpened,
      );
    } else {
      this.openRowGroups.push(idOpened);
    }
  }

  launchFormAdder(rowNode: RowNode) {
    this.$emit('add', rowNode, { parent: rowNode.data.id });
  }

  refreshBranch(node: RowNode) {
    const getParent = (parentId: string): RowNode => {
      return this.gridApi.getRowNode(parentId).parent as RowNode;
    };
    let branch: string[] = [node.data.id];
    let parentNode: RowNode = node.parent as RowNode;
    while (parentNode.level > 0) {
      branch.push(parentNode.id);
      if (parentNode.parent) {
        parentNode = getParent(parentNode.id);
      }
    }
    this.gridApi.purgeServerSideCache(branch.reverse());
  }

  setPotentialParent(overNode: RowNode | null) {
    // This validates parents, updates the highlighting by refreshing the new and old cells
    let newPotentialParent: RowNode | null;
    if (overNode) {
      newPotentialParent = overNode;
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
    this.potentialParent = newPotentialParent;
    this.gridApi.refreshCells({
      rowNodes: rowsToRefresh,
      force: true,
    });
  }
}
</script>

<style>
.hover-over {
  background-color: #e5e5ff;
}

.ag-theme-material .ag-cell-data-changed {
  background-color: transparent !important;
  border: 0.5px green !important;
}
.ag-theme-material .ag-cell-data-changed-animation {
  background-color: transparent;
  border: transparent green !important;
  transition: background-color 1s;
}
</style>
