import { RowData } from './grid';

export interface TreeData {
  id: string;
  parent: number;
  name?: string;
  [key: string]: any;
}
export type __TypeKind =
  | 'SCALAR'
  | 'OBJECT'
  | 'INTERFACE'
  | 'UNION'
  | 'ENUM'
  | 'INPUT_OBJECT'
  | 'LIST'
  | 'NON_NULL';

export type __TypeName =
  | 'Boolean'
  | 'Date'
  | 'Float'
  | 'Int'
  | 'ID'
  | 'String'
  | 'ltree';

export interface HasuraField {
  name: string;
  type: {
    name: __TypeName;
    kind: __TypeKind;
    ofType: {
      name: __TypeName;
      kind: __TypeKind;
      enumValues: string[];
      ofType: {
        kind: __TypeKind;
        name: string;
      };
    };
  };
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

export interface TableQueryResult {
  data: {
    __type: {
      fields: HasuraField[];
    };
  };
}
