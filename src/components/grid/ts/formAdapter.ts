import { CellParams } from '@/types/config';
import { FormSchema, FormFields } from '@/types/form';

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
