import { ICellRendererParams, IFilterParams, ICellEditorParams } from 'ag-grid-community';
import { QueryType, TreeStructure } from './api';

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
export enum GridType { Full, OneToMany, ManyToMany, DragTo, DragFrom };

export enum CustomColumn {
  Edit = 'Edit',
  Unlink = 'Unlink',
  Drag = 'Drag',
}


export enum ColumnTypes {
  booleanColumn,
  textColumn,
  numberColumn,
  selectColumn,
  treeColumn,
}

export interface GridFilterModel {
  [key: string]: {
    filterType: string;
    values?: string[];
  };
}

export interface GridSortModel {
  [key: string]: string;
}

export interface RowData {
  id: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface TreeRendererParams extends ICellRendererParams{
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
  multiple
}
