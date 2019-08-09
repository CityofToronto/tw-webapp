import { ColDef, IServerSideGetRowsRequest, RowNode } from 'ag-grid-community';

export interface Query {
  tableName: string,
};

export interface FieldQuery extends Query {
  fields: string[],
}

export interface AddQuery extends Query {
  newData?: object,
  callBack(): void,
  id?: number,
  relationalId?: number,
  relationshipType?: 'oneToMany' | 'manyToMany' | undefined,
  dependsOn?: string,
};

export interface UpdateQuery extends AddQuery {
  rowNode?: RowNode,
  unsuccessfulCallBack(): void,
}

export interface SortQuery extends AddQuery {
  request: IServerSideGetRowsRequest,
  columns: ColDef,
};

export interface DeleteQuery extends Query {
  id: number,
  callBack(): void,
  unsuccessfulCallBack(): void,
};

export interface QueryError {
  message: string,
};

export interface TableTypes {
  name: string,
  type: {
    name: string,
    kind: 'SCALAR' | 'LIST' | 'OBJECT',
    ofType: {
      name: string,
      kind: 'SCALAR' | 'LIST' | 'OBJECT',
    }
  }
}

export interface TableQueryResult {
  data: {
    __type: {
      fields: TableTypes[]
    }
  }
};
