import { TreeGridConfig, BaseGridConfig } from '../types/config';
import { ColDef } from 'ag-grid-community';

/**
 * @description List of table string enums.
 *    Format is 'tableName' = 'nameOfTableInDatabase'.
 *    tableName can equal or be different than nameOfTableInDatabase
 */
export type Table = keyof GridConfigurations;

export type GridConfigurationTypes = GridConfigurations[keyof GridConfigurations];

export interface GridConfigurations {
  WORK_TYPE: TreeGridConfig;
  activity: BaseGridConfig;
}

const defaultColumnDefintions: ColDef = {
  resizable: true,
  editable: true,
  sortable: true,
};

export const defaultValues: BaseGridConfig = {
  hiddenColumns: [],
  omittedColumns: [],
  columnButtons: [],
  defaultColumnDefintions,
};

export const defaultTreeValues: TreeGridConfig = {
  ...defaultValues,
  groupColumn: 'id',
  groupNameColumn: {
    field: 'name',
  },
};
