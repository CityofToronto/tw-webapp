import { CellValueChangedEvent, ColDef } from 'ag-grid-community';
import _ from 'lodash';
import { getColumns, update, getRelationships } from '../apollo';
import * as FIELDS from './grid.columns';
import * as GRID_CONFIG from './grid.config';
import { TableTypes } from '../apollo/types';
import { getValidTypes } from '../apollo/lib/query';

export type ColumnTypes = 'booleanColumn' | 'numberColumn' | 'textColumn' | 'selectColumn';

interface CustomDef extends ColDef {
  colType: ColumnTypes,
}

/**
 *  This function will output additional properties for each column type.
 *  This is needed as these are unique for the column types
 *  colType is defined here to be used in the DynamicForm.vue to render
 *  the correct form input
 */
const getColumnProperties = async (
  column: TableTypes, relationships: TableTypes[],
): Promise<ColDef> => {
  const columnTypes = {
    textColumn: (): CustomDef => ({
      valueParser: ({ newValue }:{newValue: string}):string => newValue,
      filter: 'agTextColumnFilter',
      colType: 'textColumn',
    }),
    booleanColumn: (): CustomDef => ({
      valueParser: ({ newValue }:{newValue: string}) => newValue === 'true',
      filter: 'agSetColumnFilter',
      filterParams: {
        debounceMs: 200,
        values: [true, false],
      },
      colType: 'booleanColumn',
    }),
    numberColumn: (): CustomDef => ({
      valueParser: ({ newValue }:{newValue: string}) => Number(newValue),
      filter: 'agNumberColumnFilter',
      colType: 'numberColumn',
    }),
    selectColumn(values: string[]): CustomDef {
      return {
        valueParser: ({ newValue }:{newValue: string}) => newValue,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          values,
          cellHeight: 41,
        },
        colType: 'selectColumn',
      };
    },
  };

  const relationshipNames = relationships.map(col => col.name);
  // First check if it is a select column
  // tradeType to TRADE_TYPE, where TRADE_TYPE is defined in Hasura
  const columnNameUpperSnakeCase = _.snakeCase(column.name).toUpperCase();
  if (relationshipNames.includes(columnNameUpperSnakeCase)) {
    const values = await getValidTypes({ tableName: `${columnNameUpperSnakeCase}S` });
    return columnTypes.selectColumn(values);
  }
  const typeName = column.type.ofType ? column.type.ofType.name : column.type.name;
  if (typeName === 'Int' || typeName === 'numeric') {
    return columnTypes.numberColumn();
  }
  if (typeName === 'Boolean') {
    return columnTypes.booleanColumn();
  }

  return columnTypes.textColumn();
};

export const defineColumn = async (
  column: TableTypes, editable: boolean, relationships: TableTypes[],
): Promise<ColDef> => {
  const additionalProperties = await getColumnProperties(column, relationships);

  const columnData: ColDef = {
    headerName: FIELDS.HEADERS.get(column.name),
    field: column.name,
    resizable: true,
    editable: column.name !== 'id' && editable,
    hide: column.name.includes('_id'),
    sort: column.name === 'id' ? 'asc' : undefined,
    sortable: true,
    ...additionalProperties,
  };
  return columnData;
};

/**
 * Return Ag-Grid ColumnDefs for a tableName
 *
 * @param editable: whether the columns are editable
 * @returns ColDef[]
 */
export const getColumnDefs = async (
  { tableName, editable }:{tableName: string; editable: boolean}): Promise<ColDef[]> => {
  const columns = await getColumns({
    tableName,
  });

  const relationships = await getRelationships({
    tableName,
  });

  // This defines the columns, it determines if it is a number column,
  // a boolean, a text field or selection field
  // If selection, it fetches the values from the value list
  const columnDefs = columns.map(async (column) => {
    const colDef = await defineColumn(column, editable, relationships);
    return colDef;
  });

  const colDefs = await Promise.all(columnDefs).then(response => response);

  // Insert the edit button to the front of the column definitions
  colDefs.unshift(GRID_CONFIG.editColumn);
  return colDefs;
};

// To update a cell, the database is mutated and if successful, the ag-grid
// API sets the data, and if not it is rejected and reset
export const updateCell = async (
  { event, tableName }: {event: CellValueChangedEvent; tableName: string},
) => {
  const callBack = () => {
    event.node.setData(event.data);
  };

  const unsuccessfulCallBack = () => {
    event.node.setDataValue(event.column.getColId(), event.oldValue);
  };

  await update({
    tableName,
    newData: event.data,
    id: event.data.id,
    callBack,
    unsuccessfulCallBack,
  });
};
