/* eslint-disable @typescript-eslint/camelcase */

import { ColumnTypes } from '@/types/grid';
import { GridType, GridConfigurationTypes } from '@/types/config';

export const gridConfig: GridConfigurationTypes = {
  // Properties pertaining for loading the 'WORK_TYPE' table
  WORK_TYPE: {
    gridType: GridType.Tree,
    overrideColumnDefinitions: [
      {
        field: 'asset',
        cellType: ColumnTypes.rearrangeColumn,
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
      // {
      //   field: 'workType',
      //   cellType: ColumnTypes.selectColumn,
      //   sourceTableName: 'WORK_TYPE',
      // },
      {
        field: 'procedureName',
        headerName: 'Procedure Name!',
        cellType: ColumnTypes.rearrangeColumn,
      },
    ],
    customFilterModel: {
      shutDown: {
        filterType: 'text',
        filter: 'true',
        type: 'equals',
      },
    },
  },
};
