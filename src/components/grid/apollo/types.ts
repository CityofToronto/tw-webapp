import { ColDef, IServerSideGetRowsRequest } from 'ag-grid-community';

export interface Query {
  tableName: string,
};

export interface AddQuery extends Query {
  rowData?: [],
  callBack(): void,
  id?: number,
  relationalId?: number,
  relationshipType?: 'oneToMany' | 'manyToMany' | undefined,
  dependsOn?: string,
};

export interface SortQuery extends AddQuery {
  request: IServerSideGetRowsRequest,
  columns: ColDef,
};

export interface DeleteQuery extends Query {
  id: number,
};

export interface QueryError {
  message: string,
};
