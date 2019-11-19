import { CellParams } from '@/types/config';
import { FormSchema, FormFields } from '@/types/form';
import { TableQueryResult, HasuraField } from '@/types/api';
import apolloClient from '@/apollo';
import gql from 'graphql-tag';

const convertCellType = (columnDef: CellParams): FormFields => {
  switch (columnDef.cellType) {
    case 'booleanCell':
      return { type: 'boolean' };
    case 'textCell':
      return { type: 'text' };
    case 'numberCell':
      return { type: 'number' };
    case 'rearrangeCell':
      return { type: 'text' };
    case 'selectCell':
      return { type: 'enum', items: columnDef.enumValues.map((x) => x.name) };
    case 'treeCell':
      return { type: 'tree', items: columnDef.cellRendererParams.treeData };
    case undefined:
      return { type: 'text' };
  }
};

export const columnDefsToFormSchema = (
  columnDefs: CellParams[],
): FormSchema => {
  const formFields = columnDefs
    .filter((col) => col.field && col.headerName)
    .map((col) => ({
      field: convertCellType(col),
      readonly: col.readonly ?? false,
      property: col.field,
      label: col.headerName ?? '',
    }));

  return {
    properties: formFields,
  };
};

const hasuraToFormSchema = async (tableName: string): Promise<FormSchema> => {
  const typename = await apolloClient.getTypename(tableName);
  const response = await apolloClient.query<{ __type: HasuraField }>({
    query: gql`
    {
      {
        __type(name: "${typename}") {
          fields {
            name
            type {
              kind
              ofType {
                name
                kind
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
    `,
  });
};
