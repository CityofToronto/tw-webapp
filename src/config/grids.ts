/* eslint-disable @typescript-eslint/camelcase */

import { CellType, RowStyleParams, MergeContext } from '@/types/grid';
import { GridType, GridConfigurationInterface } from '@/types/config';
import agComponents from '@/components/grid/ag-components';
import * as toolbarItems from '@/components/grid/ts/toolbarItems';
import * as contextItems from '@/components/grid/ts/contextItems';
import * as gridEvents from '@/components/grid/ts/gridEvents';
import * as gridButtons from '@/components/grid/ts/ColumnDefiner/gridButtons';
import { ICellRendererParams } from 'ag-grid-community';

export const gridConfig: GridConfigurationInterface = {
  // Properties pertaining for loading the 'WORK_TYPE' table
  activity2: {
    gridType: GridType.Normal,
    tableName: 'activity',
    gridButtons: [gridButtons.editButton],
    toolbarItems: [toolbarItems.addRow, toolbarItems.togglePanel],
    overrideColumnDefinitions: [
      {
        field: 'id',
        hide: true,
        showInForm: false,
      },
    ],
    contextMenu: [contextItems.selectAllChildren],
  },
  unassigned_assets: {
    gridType: GridType.Normal,
    toolbarItems: [],
    title: 'Unassigned Assets',
    gridEvents: [gridEvents.onDropAsset, gridEvents.dragOver],
    overrideColumnDefinitions: [
      {
        field: 'asset_serial_number',
        headerName: 'Asset Serial Number',
        cellType: CellType.rearrangeCell,
      },
      {
        field: 'id',
        hide: true,
        showInForm: false,
      },
    ],
  },
  reconciliation_view: {
    tableName: 'reconciliation_view',
    title: 'Reconciliation',
    gridType: GridType.Tree,
    treeData: true,
    suppressRowClickSelection: true,
    gridButtons: [gridButtons.editButton],
    toolbarItems: [toolbarItems.addRow],
    getDataPath: (data) => data.full_path.split('.'),
    gridEvents: [
      gridEvents.rowDragLeft,
      gridEvents.rowDragMoved,
      gridEvents.rowDragEnd,
    ],
    sortingOrder: ['id', 'role_number', 'role_name', 'asset_serial_number'],
    omittedColumns: [
      'role_exists',
      'role_missing_from_registry',
      'project_id',
      'asset_exists',
      'asset_missing_from_registry',
      'full_path',
    ],
    autoGroupColumnDef: {
      resizable: true,
      rowDrag: true,
      width: 400,
      cellRendererParams: {
        aliasColumn: 'role_number', //TODO move to config
        checkbox: true,
        innerRendererFramework: agComponents.AliasCell,
      },
      cellClassRules: {
        'hover-over': (params: MergeContext<ICellRendererParams>) =>
          params.node === params.context.vueStore.grid.potentialParent,
      },
    },
    getRowStyle: (params: RowStyleParams) => {
      if (params.data) {
        if (!params.data.role_exists) {
          return { color: '#BDBDBD' };
        }
      }
    },
    overrideColumnDefinitions: [
      {
        field: 'id',
        headerName: 'Role ID',
        hide: true,
        showInForm: false,
      },
      {
        field: 'role_number',
        headerName: 'Role Number',
        hide: true,
      },
      {
        field: 'role_name',
        headerName: 'Role Name',
      },
      {
        field: 'asset_id',
        hide: true,
        showInForm: false,
      },
      {
        field: 'asset_serial_number',
        headerName: 'Asset Serial Number',
        cellType: CellType.rearrangeCell,
        showInForm: false,
      },
      {
        field: 'parent',
        hide: true,
        showInForm: false,
      },
    ],
  },
};
