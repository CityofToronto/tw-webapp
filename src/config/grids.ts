/* eslint-disable @typescript-eslint/camelcase */

import { CellType, ColumnButton, RowStyleParams } from '@/types/grid';
import { GridType, GridConfigurationInterface } from '@/types/config';

export const gridConfig: GridConfigurationInterface = {
  // Properties pertaining for loading the 'WORK_TYPE' table
  role_asset: {
    gridType: GridType.Tree,
    overrideColumnDefinitions: [
      {
        field: 'asset_name',
        headerName: 'Asset Name',
        cellType: CellType.rearrangeCell,
      },
      {
        field: 'id',
        hide: true,
      },
      {
        field: 'name',
        hide: true,
      },
      {
        field: 'parent',
        hide: true,
      },
    ],
  },
  unassigned_assets: {
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
    title: '',
    gridType: GridType.Drop,
    columnButtons: [ColumnButton.AddTree],
    sortingOrder: ['id', 'role_number', 'role_name', 'asset_serial_number'],
    omittedColumns: [
      'role_exists',
      'role_missing_from_registry',
      'project_id',
      'asset_exists',
      'asset_missing_from_registry',
    ],
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
