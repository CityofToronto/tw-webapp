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
