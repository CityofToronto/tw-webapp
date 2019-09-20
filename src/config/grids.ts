/* eslint-disable @typescript-eslint/camelcase */

import { CellType, FilterType } from '@/types/grid';
import { GridType, GridConfigurationInterface } from '@/types/config';

export const gridConfig: GridConfigurationInterface = {
  // Properties pertaining for loading the 'WORK_TYPE' table
  WORK_TYPE: {
    gridType: GridType.Tree,
    overrideColumnDefinitions: [
      {
        field: 'asset',
        cellType: CellType.rearrangeCell,
      },
      {
        field: 'parent',
        hide: true,
      },
      {
        field: 'id',
        hide: true,
      },
      {
        field: 'name',
        hide: true,
      },
    ],
  },
  role_asset: {
    gridType: GridType.Tree,
    overrideColumnDefinitions: [
      {
        field: 'asset_name',
        headerName: 'Asset Name',
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
  inactive_asset: {
    overrideColumnDefinitions: [
      {
        field: 'role_id',
        hide: true,
      },
      {
        field: 'id',
        hide: true,
      },
    ],
  },
  activity: {
    pagination: false,
    rowDragManaged: true,
    overrideColumnDefinitions: [
      {
        field: 'procedureName',
        headerName: 'Procedure Name!',
        cellType: CellType.rearrangeCell,
      },
    ],
    customFilterModel: {
      shutDown: {
        filterType: FilterType.text,
        filter: 'true',
        type: 'equals',
      },
    },
  },
};
