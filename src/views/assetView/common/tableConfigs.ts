import { GridConfiguration } from '@/types/config';
import * as toolbarItems from '@/components/grid/ts/toolbarItems';
import * as gridEvents from '@/components/grid/ts/gridEvents/';
import * as gridButtons from '@/components/grid/ts/ColumnFactory/gridButtons';
import * as contextItems from '@/components/grid/ts/contextItems';

import { isCurrentProject } from './conditionals';
import {
  expandAndFit,
  dragOutside,
  rearrangeMixin,
  parentState,
} from './mixins';
import { RowStyleParams, MergeContext } from '@/types/grid';
import {
  ICellRendererParams,
  RowDragEndEvent,
} from '@ag-grid-enterprise/all-modules';
import { roleClassRules, assetGetStyle } from './cssStyles';
import { useGridMixin } from '@/components/grid/ts/gridConfigMixin';
import { orphanBranch } from './orphanage';
import _ from 'lodash';

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
    const removeData = {
      id: params.data.id,
    };
    params.context.gridInstance.removeRows({
      rowsToRemove: [removeData],
    });
  },
});

export const updateReconciliationConfig = (): GridConfiguration =>
  useGridMixin([expandAndFit, dragOutside, rearrangeMixin(1)], {
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
      gridEvents.doubleClickView(), // double click to open view (shows more details)
    ],
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
            // Only approved roles will be draggable
            //rowDrag: ({ data }) => isApproved(data),
            dndSource: ({ data }) => isApproved(data),
            valueFormatter: (params) => params?.data?.role_number ?? 'unknown',
            headerName: 'Role Number',
            cellRenderer: 'agGroupCellRenderer',
            cellRendererParams: {
              suppressCount: true, // the count is weird when rearranging, so disabled it
            },
            cellClassRules: {
              // css styling that highlights the potential parent when rearranging the hierarchy
              ...roleClassRules,
              'hover-over': (params: MergeContext<ICellRendererParams>) => {
                return params.node === parentState.potentialParent;
              },
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
            conditional: ({ data, value }) => isApproved(data) && value, // this controls whether a row is draggable
            headerClass: 'asset-separator', // apply the separator between role and asset
            cellClass: 'asset-separator',
            cellStyle: assetGetStyle(),
          },
        ],
      },
    ],
  });

const onDropAsset = gridEvents.createGridEvent<DragEvent>(function(
  idToAssign: number,
) {
  return {
    type: 'drop',
    callback: () => {
      if (this.event.dataTransfer) {
        // Get event data from clipboard
        const eventData = JSON.parse(
          this.event.dataTransfer.getData('application/json'),
        );
        // if asset id is empty, exit
        if (!eventData.asset_id) return;
        const rowData = {
          id: eventData.asset_id,
          role_id: idToAssign,
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

/**
 * @param idToAssign - the id to assign when an asset is dropped onto the grid
 */
export const unassignedConfigObject = (idToAssign: number) =>
  useGridMixin([expandAndFit], {
    toolbarItems: [
      toolbarItems.addRow(), // register toolbar items
      toolbarItems.copyRow(),
      toolbarItems.removeRow(),
      toolbarItems.fitColumns(),
      toolbarItems.sizeColumns(),
    ],

    getRowStyle: assetGetStyle(),
    gridEvents: [onDropAsset(undefined, idToAssign), gridEvents.dragOver()], // register the asset drop logic

    overrideColumnDefinitions: [
      {
        field: 'asset_serial_number',
        headerName: 'Asset Name',
        cellType: 'rearrangeCell',
        conditional: ({ data, value }) =>
          isCurrentProject(data.project_id) && value, // this controls whether a row is draggable
      },
      {
        field: 'id',
        hide: true,
        showInForm: false,
      },
    ],
  });

export const orphanLikeConfig: GridConfiguration = useGridMixin(
  [expandAndFit, dragOutside, rearrangeMixin(2)],
  {
    treeData: true,
    getDataPath: (data) => data?.full_path.split('.'),
    toolbarItems: [toolbarItems.fitColumns(), toolbarItems.sizeColumns()],
    rowClassRules: {
      'background-grey': (params: RowStyleParams) =>
        !isCurrentProject(params?.data?.project_id),
    },
    // Size the columns on initialization
    autoGroupColumnDef: {
      resizable: true,
      width: 400,
      headerName: 'Role Number',
      dndSource: true,
      valueFormatter: (params) => params?.data?.role_number ?? 'unknown',
      cellClassRules: {
        'hover-over': (params: MergeContext<ICellRendererParams>) => {
          return params.node === parentState.potentialParent;
        },
      },
      cellRendererParams: {
        suppressCount: true,
      },
    },
    overrideColumnDefinitions: [
      {
        field: 'id',
        hide: true,
      },
      {
        field: 'role_name',
      },
      {
        field: 'asset_serial_number',
      },
    ],
  },
);
