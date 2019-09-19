import {
  ICellRendererParams,
  IFilterParams,
  ICellEditorParams,
  ColDef,
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
}

export interface ColumnDefinerParams {
  omittedColumns: string[];
  hiddenColumns: string[];
}

export enum CustomCellRenderer {
  TreeView = 'TreeviewRenderer',
}

export enum CustomColumn {
  Edit = 'Edit',
  Unlink = 'Unlink',
  Drag = 'Drag',
  AddTree = 'AddTree',
}

export enum ColumnTypes {
  booleanColumn,
  textColumn,
  numberColumn,
  selectColumn,
  treeColumn,
  aliasColumn,
  rearrangeColumn,
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

type FilterTypes = 'text' | 'number' | 'array';

export interface GridFilterModel {
  [key: string]: {
    filterType: FilterTypes;
    values?: string[];
    filter?: string;
    operator?: string;
    type: Filters;
    condition1?: {
      filter: string;
      filterType: string;
      type: Filters;
    };
    condition2?: {
      filter: string;
      filterType: string;
      type: Filters;
    };
  };
}

export interface GridSortModel {
  [key: string]: string;
}

export interface RowData {
  id: number;
  parent?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
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

export enum CellSelectionType {
  single,
  multiple,
}
