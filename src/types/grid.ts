import {
  ICellRendererParams,
  IFilterParams,
  ICellEditorParams,
  ISetFilterParams,
  ColDef,
  RowNode,
  GridApi,
} from 'ag-grid-community';
import { QueryType, TreeStructure, TreeData } from '@/types/api';

export interface GridComponentOptions {
  gridTitle: string;
  gridProps: {
    autoHeight: boolean;
    showSidebar: boolean;
    draggable: boolean;
    pagination: boolean;
    queryType: QueryType;
  };
  toolbarProps: {
    controls: string[];
  };
}

/**
 * Custom pre-defined Grid Types for defining the props of GridComponent.vue
 */
export enum GridType {
  Full,
  OneToMany,
  ManyToMany,
  DragTo,
  DragFrom,
  Tree,
  Drop,
}

export interface ColumnDefinerParams {
  omittedColumns: string[];
  hiddenColumns: string[];
}

export enum CustomCellRenderer {
  TreeView = 'TreeviewRenderer',
}

export enum ColumnButton {
  Edit = 'Edit',
  Unlink = 'Unlink',
  Drag = 'Drag',
  AddTree = 'AddTree',
}

export enum CellType {
  booleanCell,
  textCell,
  numberCell,
  selectCell,
  treeCell,
  aliasCell,
  rearrangeCell,
}

export enum GridProviders {
  Direct,
  OneToMany,
  ManyToMany,
}

export interface GridDataTransformer {
  /**
   * Transform data into a form that is different
   * but that can still be handled by Ag-Grid
   */
  transform<T extends TreeData[]>(data: T): RowData[];
}

type Filters =
  | 'equals'
  | 'notEqual'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'inRange'
  | 'empty';

export enum FilterType {
  text = 'text',
  number = 'number',
  array = 'array',
}

export interface GridFilterModel {
  [key: string]: {
    filterType: FilterType;
    values?: string[];
    filter?: string;
    operator?: string;
    type: Filters;
    condition1?: {
      filter: string;
      filterType: FilterType;
      type: Filters;
    };
    condition2?: {
      filter: string;
      filterType: FilterType;
      type: Filters;
    };
  };
}

export interface GridSortModel {
  [key: string]: string;
}

export interface RowStyleParams {
  data: RowData;
  node: RowNode;
  rowIndex: number;
  api: GridApi;
  context: any;
}

export interface RowData {
  id: string;
  parent?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface ExtendedColDef extends ColDef {
  cellType: CellType;
}

export interface SetFilterParams extends ISetFilterParams {
  values: string[];
}

export interface TreeRendererParams extends ICellRendererParams {
  params: {
    value: number[] | number;
  };

  treeMap: Map<number, string>;
}

export interface TreeFilterParams extends IFilterParams {
  treeData: TreeStructure[];
  treeIds: number[];
}

export interface TreeEditorParams extends ICellEditorParams {
  treeData: TreeStructure[];
}
