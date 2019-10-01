import { ColDef, GridOptions } from 'ag-grid-community';
import { CellType, ColumnButton, GridFilterModel } from './grid';
import { MarkRequired } from 'ts-essentials';
import GridInstance from '@/components/grid/ts/GridInstance';

export enum GridType {
  Tree = 'tree',
  Normal = 'normal',
  Drop = 'drop',
}

export type CustomProperties = keyof Omit<
  SimpleGridConfig & TreeGridConfig & DropGridConfig,
  keyof GridOptions
>;

export type GridConfiguration =
  | SimpleGridConfig
  | TreeGridConfig
  | DropGridConfig;

export interface GridConfigurationInterface {
  [key: string]: GridConfiguration;
}

interface BaseGridConfig extends Omit<GridOptions, 'rowData' | 'columnDefs'> {
  title?: string;
  /**
   * Columns that are omitted from editing and display but are still queried.
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
  /**
   * Permanent low level filter
   */
  customFilterModel?: GridFilterModel;
  /**
   * Order of the columns from left to right
   */
  columnOrder?: string[];
}

export interface SimpleGridConfig extends BaseGridConfig {
  gridType?: Exclude<GridType, GridType.Tree | GridType.Drop>;
}

export interface TreeGridConfig extends BaseGridConfig {
  /**
   * Table column field to group by.
   * By default it uses the 'id' field.
   */
  gridType: GridType.Tree;
}

export interface DropGridConfig extends BaseGridConfig {
  gridType: GridType.Drop;
  onDropFunction?: (event: DragEvent, gridInstance: GridInstance) => void;
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

export interface BaseColumnParams extends ColDefRequiredField {
  showInForm?: boolean;
  cellType?: Exclude<CellType, CellType.treeCell | CellType.selectCell>;
}
interface SelectColumnParams extends ColDefRequiredField {
  cellType: CellType.selectCell;
  enumValues: {
    name: string;
  }[];
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
   * Source table for tree column requires 'id, name, parent' field
   */
  sourceTableName: string;
}
