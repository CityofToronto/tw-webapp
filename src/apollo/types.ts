import { HasuraField } from '@/types/api';
import { RowData } from '@/types/grid';

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
  ManyToMany = 'ManyToMany',
}

export interface AddQuery {
  rowsToAdd: { [key: string]: any }[];
}

export interface UpdateQuery {
  rowsToUpdate: RowData[];
}

export interface RemoveQuery {
  rowsToRemove: RowData[];
}

export interface TableQueryResult {
  data: {
    __type: {
      fields: HasuraField[];
    };
  };
}
