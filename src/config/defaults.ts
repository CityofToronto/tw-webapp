import {
  GridType,
  SimpleGridConfig,
  GridConfigurationTypes,
} from '../types/config';
import { ColDef } from 'ag-grid-community';
import { CustomColumn } from '@/types/grid';

const defaultColDef: ColDef = {
  resizable: true,
  editable: true,
  sortable: true,
};

export const defaultValues: SimpleGridConfig = {
  omittedColumns: [],
  columnButtons: [CustomColumn.Edit],
  defaultColDef,
};

export const defaults: { [key in GridType]: GridConfigurationTypes } = {
  [GridType.Tree]: {
    gridType: GridType.Tree,
    columnButtons: [CustomColumn.Edit],
    autoGroupColumnDef: {},
  },
};

export const getDefaultColDef = (
  gridType: GridType | undefined,
): SimpleGridConfig => {
  if (gridType) {
    return {
      ...defaultValues,
      ...defaults[gridType],
    };
  }
  return defaultValues;
};
