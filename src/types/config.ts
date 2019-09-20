import { ColDef, GridOptions } from 'ag-grid-community';
import { CellType, ColumnButton, GridFilterModel } from './grid';
import { MarkRequired } from 'ts-essentials';

export enum GridType {
  Tree = 'tree',
  Normal = 'normal',
}

export type GridConfiguration = SimpleGridConfig | TreeGridConfig;

export interface GridConfigurationInterface {
  [key: string]: GridConfiguration;
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
  columnButtons?: ColumnButton[];
  /**
   * Array of extended column definitions (based on their CellType)
   */
  overrideColumnDefinitions?: CellParams[];
  customFilterModel?: GridFilterModel;
}

export interface SimpleGridConfig extends BaseGridConfig {
  gridType?: Exclude<GridType, GridType.Tree>;
}

export interface TreeGridConfig extends BaseGridConfig {
  /**
   * Table column field to group by.
   * By default it uses the 'id' field.
   */
  gridType: GridType.Tree;
}

/**
 * Typings for internal type safety, should not be used
 */
export type CellParams =
  | BaseColumnParams
  | SelectColumnParams
  | ExternalDataParams;

/**
 * Typings for internal type safety, should not be used
 */
type ColDefRequiredField = MarkRequired<ColDef, 'field'>;

interface BaseColumnParams extends ColDefRequiredField {
  cellType?: Exclude<CellType, CellType.treeCell | CellType.selectCell>;
}
interface SelectColumnParams extends ColDefRequiredField {
  cellType: CellType.selectCell;
  enumValues: string[];
}

/**
 * The two types of Cells: select and tree require additional
 * data for processing
 */
interface ExternalDataParams extends ColDefRequiredField {
  cellType: CellType.treeCell;
  /**
   * Name of the source table to get values from.
   *
   * Source table for select required 'name' field.
   *
   * Source table for tree column requies 'id, name, parent' field
   */
  sourceTableName: string;
}
