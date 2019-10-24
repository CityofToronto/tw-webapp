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
import GridInstance from '@/components/grid/ts/GridInstance';
import Store from '@/store/store';
import { GridConfiguration } from './config';
import { MarkRequired, Merge } from 'ts-essentials';

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

export type RequiredConfig = MarkRequired<
  GridConfiguration,
  'tableName' | 'tableID' | 'title'
>;

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

export interface FunctionProps {
  gridInstance: GridInstance;
  vueStore: Store;
}

export interface GridButtonRendererParams {
  icon: string | ((params: MergeContext<ICellRendererParams>) => string);
  clickFunction?: (params: MergeContext<ICellRendererParams>) => void;
}

export type MergeContext<T> = Merge<T, { context: GridContext }>;

export interface GridContext {
  gridInstance: GridInstance;
  vueStore: Store;
  parentComponent: any;
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

export interface FormData {
  [key: string]: string;
}

export interface GridSortModel {
  [key: string]: string;
}

export interface RowStyleParams {
  data: RowData;
  node: RowNode;
  rowIndex: number;
  api: GridApi;
  context: GridContext;
}

export interface RowData {
  id: string;
  parent?: string | number;
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
