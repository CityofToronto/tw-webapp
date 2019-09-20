import { RowData } from './grid';

export interface TreeData {
  id: number;
  parent: number;
  name?: string;
  [key: string]: any;
}

export interface TreeStructure extends TreeData {
  children?: TreeData[];
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
  ManyToMany = 'ManyToMany',
}

interface CallbackQuery {
  successCallback?: () => void;
  failCallback?: () => void;
}

export interface AddQuery extends CallbackQuery {
  rowsToAdd: { [key: string]: any }[];
}

export interface UpdateQuery extends CallbackQuery {
  rowsToUpdate: RowData[];
}

export interface RemoveQuery extends CallbackQuery {
  rowsToRemove: RowData[];
}
