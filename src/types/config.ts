import { ColDef, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { CellType, MergeContext, FunctionProps } from './grid';
import { MarkRequired } from 'ts-essentials';
import GridInstance from '@/components/grid/ts/GridInstance';
import { ToolbarItem } from '@/components/grid/ts/toolbarItems';
import Store from '@/store/store';
import { MenuItem } from '@/components/grid/ts/contextItems';
import { GridButton } from '@/components/grid/ts/ColumnFactory/gridButtons';

export enum GridType {
  Tree = 'tree',
  Normal = 'normal',
  Drop = 'drop',
}

type DefaultContextItems =
  | 'autoSizeAll'
  | 'expandAll'
  | 'contractAll'
  | 'copy'
  | 'copyWithHeadersCopy '
  | 'paste'
  | 'resetColumns'
  | 'export'
  | 'chartRange'
  | 'separator';

export interface VueEventParams<T> {
  event: T;
  gridInstance: GridInstance;
  vueStore: Store;
}

export interface VueEvent<T> {
  type: string;
  conditional?: (eventParams: VueEventParams<T>) => boolean;
  callback: (eventParams: VueEventParams<T>) => void;
}

export type CustomProperties = keyof Omit<
  SimpleGridConfig & TreeGridConfig & DropGridConfig,
  keyof GridOptions
>;

export type GridConfiguration =
  | SimpleGridConfig
  | TreeGridConfig
  | DropGridConfig;

export type GridConfigurationInterface = Record<string, GridConfiguration>;

interface BaseGridConfig extends Omit<GridOptions, 'rowData' | 'columnDefs'> {
  /**
   * ID of table to fetch from database
   * By default it uses the key of the this object
   */
  tableID?: string;
  /**
   * Name of table to fetch from database
   * By default it uses the key of the this object
   */
  tableName?: string;
  /**
   * Define a title that is displayed on the toolbar. If omitted with use the
   * name of the database table.
   */
  title?: string;
  /**
   * Columns that are omitted from editing and display but are still queried.
   * Example use case is for alias fields.
   */
  omittedColumns?: string[];
  /**
   * Array of custom grid buttons.
   * Examples are edit, delete
   */
  gridButtons?: GridButton[];
  /**
   * Array of extended column definitions (based on their CellType)
   */
  overrideColumnDefinitions?: CellParams[];
  /**
   * Order of the columns from left to right
   */
  columnOrder?: string[];
  /**
   * Items displayed in the toolbar
   */
  toolbarItems: ToolbarItem[];
  /**
   * Events to bind to the ag-Grid instance
   */
  gridEvents?: VueEvent<any>[];
  /**
   * Custom items to add to the context menu (right click)
   * By default, it has copy, paste and export.
   * separator draws a line between items
   */
  contextMenu?: (MenuItem | DefaultContextItems)[];
  /**
   * This event is called when the grid finishes loading
   */
  gridInitializedEvent?: (params: FunctionProps) => void;
}

export interface SimpleGridConfig extends BaseGridConfig {
  gridType?: 'normal';
}

export interface TreeGridConfig
  extends MarkRequired<BaseGridConfig, 'getDataPath'> {
  /**
   * Table column field to group by.
   * By default it uses the 'id' field.
   */
  gridType: 'tree';
  /**
   * This must be set to true
   */
  treeData: boolean;
}

export interface DropGridConfig extends BaseGridConfig {
  gridType: 'drop';
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

interface CommonParams {
  cellType?: CellType;
  showInForm?: boolean;
  showInView?: boolean;
  readonly?: boolean;
  conditional?: (params: MergeContext<ICellRendererParams>) => boolean;
}

export interface BaseColumnParams extends ColDefRequiredField, CommonParams {
  cellType?: Exclude<CellType, 'selectCell' | 'treeCell'>;
}
interface SelectColumnParams extends ColDefRequiredField, CommonParams {
  cellType: 'selectCell';
  enumValues: {
    name: string;
  }[];
}

/**
 * The two types of Cells: select and tree require additional
 * data for processing
 */
interface ExternalDataParams extends ColDefRequiredField, CommonParams {
  cellType: 'treeCell';
  /**
   * Name of the source table to get values from.
   *
   * Source table for select required 'name' field.
   *
   * Source table for tree column requires 'id, name, parent' field
   */
  sourceTableName: string;
}

export interface CellRendererParams extends MergeContext<ICellRendererParams> {
  conditional: (params: MergeContext<ICellRendererParams>) => boolean;
}
