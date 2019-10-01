import { GridType, GridConfiguration } from '../types/config';
import { ColDef } from 'ag-grid-community';
import { ColumnButton } from '@/types/grid';

const defaultColDef: ColDef = {
  resizable: true,
  editable: true,
  sortable: true,
};

export const defaults: {
  [key in GridType]: GridConfiguration;
} = {
  [GridType.Drop]: {},
  [GridType.Tree]: {
    gridType: GridType.Tree,
    columnButtons: [ColumnButton.Edit],
    autoGroupColumnDef: {},
  },
  [GridType.Normal]: {
    omittedColumns: [],
    columnButtons: [ColumnButton.Edit],
    defaultColDef,
  },
};

export const getDefaultColDef = (
  gridType: GridType | undefined,
): GridConfiguration => {
  if (gridType) {
    return {
      ...defaults[GridType.Normal],
      ...defaults[gridType],
    };
  }
  return defaults[GridType.Normal];
};
