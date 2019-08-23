import { IServerSideGetRowsRequest, RowNode } from 'ag-grid-community';
import { SelectionType, CellSelectionType } from '@/types/grid';


export interface RowData {
  id: number;
  [key: string]: any;
}

export interface TreeResponse {
  id: number;
  type: string;
  parent: number | null;
}

export interface TreeStructure extends TreeResponse {
  children?: TreeResponse[];
}

export interface RelationalQuery {
  /** ID of the row you want to update or delete */
  rowId?: number;
  /**  */
  relatedRowId?: number;
  /** The related table name in relation to the tableName */
  relatedTableName?: string;
}

export interface FieldQuery {
  fields: string[];
}

export enum QueryType {
  Direct = 'Direct',
  OneToMany = 'OneToMany',
  ManyToMany = 'ManyToMany'
}

interface CallbackQuery {
  successCallback?: () => void;
  failCallback?: () => void;
}

export interface AddQuery extends CallbackQuery {
  rowsToAdd: {[key: string]: any}[];
};

export interface UpdateQuery extends CallbackQuery {
  rowsToUpdate: RowData[];
}

export interface GetRowsQuery extends RelationalQuery {
  request: IServerSideGetRowsRequest;
  columnNames: string[];
};

export interface RemoveQuery extends CallbackQuery {
  rowsToRemove: RowData[];
};

export interface QueryError extends Error{
  message: string;
};

export interface TableTypes {
  name: string;
  type: {
    name: string;
    kind: 'SCALAR' | 'LIST' | 'OBJECT';
    ofType: {
      name: string;
      kind: 'SCALAR' | 'LIST' | 'OBJECT';
    };
  };
  selectionType: CellSelectionType;
}

export interface TableQueryResult {
  data: {
    __type: {
      fields: TableTypes[];
    };
  };
};
