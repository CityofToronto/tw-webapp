import { ColDef, GridOptions } from 'ag-grid-community';
import { ColumnTypes, CustomColumn, GridFilterModel } from './grid';
import { MarkRequired } from 'ts-essentials';

export enum GridType {
  Tree = 'tree',
}

export interface GridConfigurationTypes {
  [key: string]: SimpleGridConfig | TreeGridConfig;
}

interface BaseGridConfig extends Omit<GridOptions, 'rowData' | 'columnDefs'> {
  /**
   * Columns that are omitted from editting and display but are still queried.
   * Example use case is for alias fields.
   */
  omittedColumns?: string[];
  /**
   * Array of custom column buttons.
   * Examples are edit, delete
   */
  columnButtons?: CustomColumn[];
  /**
   * Array of extended column definitions (based on their CellType)
   */
  overrideColumnDefinitions?: CellParams[];
  customFilterModel?: GridFilterModel;
}

export interface SimpleGridConfig extends BaseGridConfig {
  gridType?: Exclude<GridType, GridType.Tree>;
}

export interface TreeGridConfig extends Exclude<BaseGridConfig, 'gridType'> {
  /**
   * Table column field to group by.
   * By default it uses the 'id' field.
   */
  gridType: GridType.Tree;
}

/**
 * Typings for internal type safety, should not be used
 */
export type CellParams = BaseColumnParams | ExternalDataParams;

/**
 * Typings for internal type safety, should not be used
 */
type ColDefRequiredField = MarkRequired<ColDef, 'field'>;

export interface BaseColumnParams extends ColDefRequiredField {
  cellType?: Exclude<
    ColumnTypes,
    ColumnTypes.treeColumn | ColumnTypes.selectColumn
  >;
}

/**
 * The two types of Cells: select and tree require additional
 * data for processing
 */
export interface ExternalDataParams extends ColDefRequiredField {
  cellType: ColumnTypes.selectColumn | ColumnTypes.treeColumn;
  /**
   * Name of the source table to get values from.
   *
   * Source table for select required 'name' field.
   *
   * Source table for tree column requies 'id, name, parent' field
   */
  sourceTableName: string;
}
