import { ColDef } from 'ag-grid-community';
import { ColumnTypes, CustomColumn } from './grid';

export interface BaseGridConfig {
  /**
   * Column fields that are hidden from the user.
   * NOTE: They can be unhidden in the sidebar.
   */
  hiddenColumns: string[];
  /**
   * Columns that are omitted from editting and display but are still queried.
   * Example use case is for alias fields.
   */
  omittedColumns: string[];
  /**
   * Default column definitions
   */
  defaultColumnDefintions: ColDef;
  overrideColumnDefinitions?: ExtendedColumnDef[];
  columnButtons: CustomColumn[];
}

export interface TreeGridConfig extends BaseGridConfig {
  /**
   * Table column field to group by.
   * By default it uses the 'id' field.
   */
  groupColumn: string;
  /**
   * Table column field to use as the name.
   * By default it uses the 'name' field
   */
  groupNameColumn: {
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

interface ExtendedColumnDef extends ColDef {
  cellType: ColumnTypes;
  field: string;
}
