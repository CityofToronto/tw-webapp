import {
  GridConfigurations,
  defaultTreeValues,
  defaultValues,
} from './defaults';

import { ColumnTypes } from '@/types/grid';

export const gridConfig: GridConfigurations = {
  WORK_TYPE: {
    ...defaultTreeValues,
    groupColumn: 'id',
    hiddenColumns: ['parent'],
    overrideColumnDefinitions: [
      {
        field: 'asset',
        cellType: ColumnTypes.rearrangeColumn,
      },
    ],
  },
  activity: {
    ...defaultValues,
    overrideColumnDefinitions: [
      {
        field: 'asset',
        cellType: ColumnTypes.rearrangeColumn,
      },
    ],
  },
};
