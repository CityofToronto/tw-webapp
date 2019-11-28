import { GridConfiguration } from '@/types/config';
import * as toolbarItems from '@/components/grid/ts/toolbarItems';
import * as gridEvents from '@/components/grid/ts/gridEvents/';
import * as gridButtons from '@/components/grid/ts/ColumnFactory/gridButtons';
import * as contextItems from '@/components/grid/ts/contextItems';

import { isCurrentProject } from './conditionals';
import { expandAndFit } from './mixins';
import { RowStyleParams, MergeContext } from '@/types/grid';
import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { roleClassRules, assetGetStyle } from './cssStyles';
import { useGridMixin } from '@/components/grid/ts/gridConfigMixin';
import { orphanBranch } from './orphanage';

const isApproved = (data: {
  project_id: number;
  approved: boolean;
  role_missing_from_registry: boolean;
}) => isCurrentProject(data?.project_id) && data.approved;

const addChildButton = gridButtons.createGridButton({
  icon: ({ data }) => (isApproved(data) ? 'keyboard_tab' : ''),
  tooltip: 'Add Child to This Row',
  clickFunction: ({ node, context }) =>
    context.gridInstance.componentApi.addChildToRow(node),
});

/**
 * Creates a custom grid button markDoesNotExist
 * It deletes entities that role_missing_from_registry = true
 * Otherwise, it marks as does not exist
 */
const markDoesNotExist = gridButtons.createGridButton({
  icon: ({ data }) => {
    if (!isApproved(data)) return '';
    return data?.role_missing_from_registry ? 'delete' : 'fa-eraser';
  },
  tooltip: 'Delete this Role',
  clickFunction: (params) => {
    if (params.data.role_missing_from_registry) {
      const removeData = {
        id: params.data.id,
      };
      params.context.gridInstance.removeRows({
        rowsToRemove: [removeData],
      });
    } else {
      const updateData = {
        id: params.data.id,
        role_exists: !params?.data?.role_exists,
      };
      params.context.gridInstance
        .updateRows({
          rowsToUpdate: [updateData],
        })
        .then(() => params.context.vueStore.grid.forceUpdateAllGrids());
    }
  },
});

export const updateReconciliationConfig = (
  enableDragging = true,
): GridConfiguration =>
  useGridMixin([expandAndFit], {
    treeData: true,
    groupSuppressAutoColumn: true,
    suppressRowClickSelection: true,
    gridButtons: [markDoesNotExist, addChildButton], // register our buttons
    toolbarItems: [
      toolbarItems.collapseAll(),
      toolbarItems.fitColumns(),
      toolbarItems.sizeColumns(),
    ],
    contextMenu: [orphanBranch(), contextItems.expandBranch()], // register our context menu item
    getDataPath: (data) => data?.full_path.split('.'), // tell agGrid how parse tree data
    gridEvents: [
      gridEvents.rowDragLeft(), // all these are registered for rearranging hierarchy
      gridEvents.rowDragEnd(),
      gridEvents.rowDragMoved(),
      gridEvents.rowDragEnd(),
      gridEvents.doubleClickView(), // double click to open view (shows more details)
    ],
    columnOrder: ['id', 'role_number', 'role_name', 'asset_serial_number'],
    // Size the columns on initialization and open the first group
    rowClassRules: {
      'background-grey': ({ data }: RowStyleParams) => !isApproved(data),
      'text-grey': ({ data }: RowStyleParams) => !isApproved(data),
    },
    overrideColumnDefinitions: [
      {
        headerName: 'Role',
        children: [
          {
            field: 'id',
            showRowGroup: true,
            resizable: true,
            width: 400,
            // Only reserved roles will be draggable
            rowDrag: enableDragging ? ({ data }) => isApproved(data) : false,
            valueFormatter: (params) => params?.data?.role_number ?? 'unknown',
            headerName: 'Role Number',
            cellRenderer: 'agGroupCellRenderer',
            cellRendererParams: {
              suppressCount: true, // the count is weird when rearranging, so disabled it
            },
            cellClassRules: {
              // css styling that highlights the potential parent when rearranging the hierarchy
              'hover-over': (params: MergeContext<ICellRendererParams>) =>
                params.node === params.context.vueStore.grid.potentialParent,
              ...roleClassRules,
            },
          },
          {
            field: 'role_number',
            hide: true,
            cellClassRules: roleClassRules, // apply css rules
          },
          {
            field: 'role_name',
            cellClassRules: roleClassRules, // apply css rules
          },
        ],
      },
      {
        headerName: 'Asset',
        headerClass: 'asset-separator', // apply the separator between role and asset
        children: [
          {
            field: 'asset_serial_number',
            cellType: 'rearrangeCell', // define cell to a rearrange cell
            showInForm: false, // disable this field when adding a child
            showInView: true, // show this when double clicking
            conditional: ({ data }) => isApproved(data), // this controls whether a row is draggable
            headerClass: 'asset-separator', // apply the separator between role and asset
            cellClass: 'asset-separator',
            cellStyle: assetGetStyle(),
          },
        ],
      },
    ],
  });

const onDropAsset = gridEvents.createGridEvent<DragEvent>(function() {
  return {
    type: 'drop',
    callback: () => {
      if (this.event.dataTransfer) {
        const eventData = JSON.parse(
          this.event.dataTransfer.getData('text/plain'),
        );
        if (!eventData.asset_id) return;
        const rowData = {
          id: eventData.asset_id,
          role_id: 0,
        };

        this.gridInstance
          .updateRows({
            rowsToUpdate: [rowData],
            refresh: false,
          })
          .then(() => this.vueStore.grid.forceUpdateAllGrids());
      }
    },
  };
});

export const unassignedConfigObject: GridConfiguration = {
  toolbarItems: [
    toolbarItems.addRow(), // register toolbar items
    toolbarItems.copyRow(),
    toolbarItems.removeRow(),
    toolbarItems.fitColumns(),
    toolbarItems.sizeColumns(),
  ],

  getRowStyle: assetGetStyle(),
  gridEvents: [onDropAsset(), gridEvents.dragOver()], // register the asset drop logic

  overrideColumnDefinitions: [
    {
      field: 'asset_serial_number',
      headerName: 'Asset Serial Number',
      cellType: 'rearrangeCell',
      conditional: ({ data }) => isCurrentProject(data.project_id), // this controls whether a row is draggable
    },
    {
      field: 'id',
      hide: true,
      showInForm: false,
    },
  ],
};

export const orphanLikeConfig: GridConfiguration = {
  treeData: true,
  getDataPath: (data) => data?.full_path.split('.'),
  columnOrder: ['id', 'role_number', 'role_name', 'asset_serial_number'],
  toolbarItems: [toolbarItems.fitColumns(), toolbarItems.sizeColumns()],
  rowClassRules: {
    'background-grey': (params: RowStyleParams) =>
      !isCurrentProject(params?.data?.project_id),
  },
  // Size the columns on initialization
  gridInitializedEvent: ({ gridInstance }) =>
    gridInstance.gridApi.sizeColumnsToFit(),
  autoGroupColumnDef: {
    resizable: true,
    width: 400,
    headerName: 'Role Number',
    valueFormatter: (params) => params?.data?.role_number ?? 'unknown',
    cellRendererParams: {
      suppressCount: true,
      checkbox: (params) => isCurrentProject(params?.data?.project_id),
    },
  },
  overrideColumnDefinitions: [
    {
      field: 'id',
      hide: true,
    },
    {
      field: 'project_id',
      hide: true,
    },
    {
      field: 'role_name',
    },
    {
      field: 'asset_serial_number',
    },
  ],
};
