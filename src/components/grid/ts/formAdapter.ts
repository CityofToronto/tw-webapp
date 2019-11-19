import { CellParams } from '@/types/config';
import { FormSchema, FormFields } from '@/types/form';
import {
  TableQueryResult,
  HasuraField,
  __TypeKind,
  __TypeName,
} from '@/types/api';
import apolloClient, { isColumn } from '@/apollo';
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

interface HasuraTypeResult {
  __type: {
    fields: HasuraField[];
  };
}

const mapHasuraType = (type: __TypeName): FormFields['type'] => {
  switch (type) {
    case 'Boolean':
      return 'boolean';
    case 'Date':
      return 'date';
    case 'Float':
      return 'number';
    case 'Int':
      return 'number';
    case 'ID':
      return 'text';
    case 'String':
      return 'text';
    case 'ltree':
      return 'text';
  }
};

const getType = (typename: string) => {
  return apolloClient.query<HasuraTypeResult>({
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

// const recursiveMap = async (field: HasuraField): Promise<FormFields> => {
//   if (isColumn(field)) {
//     const typename = field.type?.ofType?.name ?? field.type.name;
//     return {
//       type: mapHasuraType(typename),
//     };
//   } else if (field.type.ofType.kind === 'LIST') {
//     const response = await getType(field.type.ofType.ofType.name);
//     return {
//       type: 'table',
//       schema: response.data.__type.fields.map(recursiveMap);
//     }
//   }
// };

// const hasuraToFormSchema = async (tableName: string): Promise<FormSchema> => {
//   const typename = await apolloClient.getTypename(tableName);

//   const response = await getType(typename);

//   const fields: FormFields[] = response.data.__type.fields.map(recursiveMap);
// };
