import { ColDef, GridOptions } from 'ag-grid-community';
import { ColumnTypes, CustomColumn } from './grid';
import { MarkRequired } from 'ts-essentials';

export enum GridType {
  Tree = 'tree',
}

export interface BaseGridConfig extends GridOptions {
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
}

export interface BasicGridConfig extends BaseGridConfig {
  gridType?: undefined;
}

export interface TreeGridConfig extends BaseGridConfig {
  /**
   * Table column field to group by.
   * By default it uses the 'id' field.
   */
  gridType: GridType.Tree;
  groupColumn: string;
  /**
   * Table column field to use as the name.
   * By default it uses the 'name' field
   */
  groupNameColumn?: {
    /**
     * Table field to use to name the column
     */
    field: string;
    /**
     * If omitted it first uses the mapping list then
     * fallsback to attempting an automatic name
     */
    friendlyHeaderName?: string;
  };
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

export interface ExternalDataParams extends ColDefRequiredField {
  cellType: ColumnTypes.selectColumn | ColumnTypes.treeColumn;
  sourceTableName: string;
}
