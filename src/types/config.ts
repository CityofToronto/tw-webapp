import {
  ColDef,
  GridOptions,
  ICellRendererParams,
  ColGroupDef,
} from '@ag-grid-enterprise/all-modules';
import { CellType, MergeContext, FunctionProps } from './grid';
import { MarkRequired } from 'ts-essentials';
import GridInstance from '@/components/grid/ts/GridInstance';
import { ToolbarCall } from '@/components/grid/ts/toolbarItems';
import Store from '@/store/store';
import { ContextMenuCall } from '@/components/grid/ts/contextItems';
import { GridButton } from '@/components/grid/ts/ColumnFactory/gridButtons';
import { VueEventCall } from '@/components/grid/ts/gridEvents';
import { Vue } from 'vue/types/vue';

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
  component: Vue;
}

export interface VueEvent<T> {
  type: string;
  conditional?: boolean;
  callback: () => void;
}

export type CustomProperties = Record<
  keyof Omit<
    SimpleGridConfig & TreeGridConfig & DropGridConfig,
    keyof GridOptions
  >,
  boolean
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
   * Array of custom grid buttons.
   * Examples are edit, delete
   */
  gridButtons?: GridButton[];
  /**
   * Array of extended column definitions (based on their CellType)
   */
  overrideColumnDefinitions?: (CellParams | CustomColGroupDef)[];
  /**
   * Items displayed in the toolbar
   */
  toolbarItems?: ToolbarCall[];
  /**
   * Events to bind to the ag-Grid instance
   */
  gridEvents?: VueEventCall<any>[];
  /**
   * Custom items to add to the context menu (right click)
   * By default, it has copy, paste and export.
   * separator draws a line between items
   */
  contextMenu?: (ContextMenuCall | DefaultContextItems)[];
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

export interface CustomColGroupDef extends ColGroupDef {
  children: CellParams[];
}

/**
 * Typings for internal type safety, should not be used
 */
export type CellParams = BaseColumn | SelectColumn | ExternalColumn;

/**
 * Typings for internal type safety, should not be used
 */
type ColDefRequiredField = MarkRequired<ColDef, 'field'>;

export interface CommonCell extends ColDefRequiredField {
  // cellType: CellType;
  showInForm?: boolean;
  showInView?: boolean;
  readonly?: boolean;
  conditional?: (params: MergeContext<ICellRendererParams>) => boolean;
}

export interface BaseColumn extends CommonCell {
  cellType?: Exclude<CellType, 'selectCell' | 'treeCell'> | undefined;
}
interface SelectColumn extends CommonCell {
  cellType: 'selectCell';
  enumValues: string[];
}

interface ExternalColumn extends CommonCell {
  cellType: 'treeCell';
  sourceTableName: string;
}

export interface CellRendererParams extends MergeContext<ICellRendererParams> {
  conditional: (params: MergeContext<ICellRendererParams>) => boolean;
}
