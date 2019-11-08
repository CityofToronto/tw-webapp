import { storeInstance } from '@/store';
import { Column } from 'ag-grid-community';

export const capitalize = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export const inDebug = () => storeInstance.settings.debugStatus;

export const getColumGroupName = (column: Column) =>
  column.getOriginalParent()?.getColGroupDef().headerName;
