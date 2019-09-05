import {
  ICellRendererParams,
  IFilterParams,
  ICellEditorParams,
  ColDef,
  IServerSideDatasource,
} from 'ag-grid-community';
import { QueryType, TreeStructure } from '@/types/api';

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
  aliasColumn,
}

export enum GridProviders {
  Direct,
  OneToMany,
  ManyToMany,
}
/** A GridProvider is a class that communicates between a backend and Ag-Grid */
export interface GridProvider {
  gridDatasource: IServerSideDatasource;

  addData(
    rowToAdd: RowData,
    successCallback?: () => void,
    failCallBack?: () => void,
  ): void;

  /** Function to remove a row from source */
  removeData(
    idToRemove: number,
    successCallback?: () => void,
    failCallBack?: () => void,
  ): void;

  /**
   * In the case of MTM, updating data is not supported as
   * it would unexpectedly affect others.
   */
  updateData(
    rowToUpdate: RowData,
    successCallback?: () => void,
    failCallBack?: () => void,
  ): void;
}

export interface CustomColDef extends ColDef {
  colType: ColumnTypes;
  selectionType: CellSelectionType;
}

export interface GridDataTransformer {
  /**
   * Transform data into a form that is different
   * but that can still be handled by Ag-Grid
   */
  transform<T extends RowData[]>(data: T): RowData[];
}

export interface GridFilterModel {
  [key: string]: {
    filterType: string;
    values?: string[];
    filter?: string;
    operator?: string;
    condition1?: {
      filter: string;
      filterType: string;
      type: string;
    };
    condition2?: {
      filter: string;
      filterType: string;
      type: string;
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
