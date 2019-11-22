/* eslint-disable @typescript-eslint/no-use-before-define */
import { CellParams } from '@/types/config';
import { FormSchema, FormFields } from '@/types/form';
import { __TypeName, __Types } from '@/types/api';
import apolloClient from '@/apollo';
import _ from 'lodash';

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
      return { type: 'enum', items: columnDef.enumValues };
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

const mapHasuraType = (
  type: __TypeName,
): 'boolean' | 'date' | 'number' | 'text' => {
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

const hasuraToFormSchema = async (typename: string): Promise<FormSchema> => {
  const fields = await apolloClient.getFields(typename);
  const properties = await Promise.all(
    fields.map(async (field) => ({
      label: _.startCase(_.lowerCase(field.name)),
      property: field.name,
      readonly: true,
      field: await getFormType(field.type),
    })),
  );

  return {
    properties,
  };
};

const getFormType = async (type: __Types): Promise<FormFields> => {
  switch (type.kind) {
    case 'SCALAR':
      return {
        type: mapHasuraType(type.name),
      };
    case 'ENUM':
      return {
        type: 'enum',
        items: type.enumValues.map((val) => val.name),
      };
    case 'LIST':
      return getFormType(type.ofType);
    case 'NON_NULL':
      return getFormType(type.ofType);
    case 'OBJECT':
      return {
        type: 'table',
        schema: await hasuraToFormSchema(type.name),
      };
  }
};

export const hasuraTableToFormSchema = async (
  tableName: string,
): Promise<FormSchema> => {
  const typename = await apolloClient.getTypename(tableName);
  return hasuraToFormSchema(typename);
};
