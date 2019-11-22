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

export interface HasuraTypeResult {
  __type: {
    fields: HasuraField[];
  };
}

type __Types = EnumType | ScalarType | ListType | ObjectType | NonNull;

interface NonNull extends Type {
  kind: 'NON_NULL';
  name: null;
  ofType: __Types;
}

interface ScalarType extends Type {
  kind: 'SCALAR';
  name: __TypeName;
  ofType: null;
}

interface EnumType extends Type {
  kind: 'ENUM';
  name: string;
  enumValues: {
    name: string;
  }[];
  ofType: null;
}

interface ListType extends Type {
  kind: 'LIST';
  name: null;
  ofType: __Types;
}

interface ObjectType extends Type {
  kind: 'OBJECT';
  name: string;
  ofType: undefined;
}

interface Type {
  name: __TypeName | string | null;
  kind: __TypeKind | string;
  ofType: __Types | null | undefined;
}

export interface HasuraField {
  name: string;
  type: __Types;
}

export interface HasuraWhere {
  // TODO Make this better
  id: {
    _eq: number;
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
