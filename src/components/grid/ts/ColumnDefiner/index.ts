import { ColDef } from 'ag-grid-community';
import _ from 'lodash';
import { TableTypes } from '@/apollo/types';
import apolloClient from '@/apollo';
import { TreeData } from '@/types/api';
import { CellSelectionType, ColumnTypes, CustomColumn } from '@/types/grid';
import CustomButtonColumns from './ColumnCustomDefs';
import CustomCellTypes from './CustomCellTypes';
import ColumnHeaderMap from './ColumnHeaderMap';

const getColumnProperties = async (
  column: TableTypes,
  relationships: TableTypes[],
): Promise<ColDef> => {
  const relationshipNames = relationships.map((col): string => col.name);

  /**
   * First check if it is a select column
   * tradeType to TRADE_TYPE, where TRADE_TYPE is defined in Hasura
   */

  // TODO Fix the naming schema of the database to make this parsing much cleaner
  let columnNameToCheck: string;
  let columnNameUpperSnakeCase: string;
  if (column.selectionType === CellSelectionType.multiple) {
    columnNameToCheck = column.name;
    columnNameUpperSnakeCase = _.snakeCase(
      column.name.split('_')[1],
    ).toUpperCase();
  } else {
    columnNameToCheck = _.snakeCase(column.name).toUpperCase();
    columnNameUpperSnakeCase = _.snakeCase(column.name).toUpperCase();
  }

  // If this passes, then the column is a select or tree column
  if (relationshipNames.includes(columnNameToCheck)) {
    const tableFields = await apolloClient.getColumns(
      `${columnNameUpperSnakeCase}`,
    );
    // If value list table has a parent column, it is tree, if not it is a simple select
    if (tableFields.map((field): string => field.name).includes('parent')) {
      const treeValues = await apolloClient.getValuesFromTable<TreeData[]>(
        columnNameUpperSnakeCase,
        ['id', 'parent', 'name'],
      );
      return CustomCellTypes[ColumnTypes.treeColumn](
        treeValues,
        column.selectionType,
      );
    }
    const dropdownValues = await apolloClient.getValuesFromTable<
      { name: string }[]
    >(columnNameUpperSnakeCase, ['name']);
    return CustomCellTypes[ColumnTypes.selectColumn](
      dropdownValues.map((val): string => val.name),
      column.selectionType,
    );
  }

  // These are basic column types
  const typeName = column.type.ofType
    ? column.type.ofType.name
    : column.type.name;
  if (typeName === 'Int' || typeName === 'numeric') {
    // Return numeric
    return CustomCellTypes[ColumnTypes.numberColumn]();
  }
  if (typeName === 'Boolean') {
    // Return boolean
    return CustomCellTypes[ColumnTypes.booleanColumn]();
  }
  // Return any other as text column
  return CustomCellTypes[ColumnTypes.textColumn]();
};

export class ColumnDefiner {
  private tableName: string;

  private editableColumns: boolean;

  private customColumns: CustomColumn[];

  public constructor(
    tableName: string,
    editableColumns: boolean,
    customColumnsToAdd: CustomColumn[],
  ) {
    this.tableName = tableName;
    this.editableColumns = editableColumns;
    this.customColumns = customColumnsToAdd;
  }

  /**
   *  This function will output additional properties for each column type.
   *  This is needed as these are unique for the column types
   *  colType is defined here to be used in the DynamicForm.vue to render
   *  the correct form input
   */

  /**
   * This defines the columns, it determines if it is a number column,
   * a boolean, a text field or selection field
   * If selection, it fetches the values from the value list
   */
  private static async defineColumn(
    column: TableTypes,
    editable: boolean,
    relationships: TableTypes[],
  ): Promise<ColDef> {
    const additionalProperties = await getColumnProperties(
      column,
      relationships,
    );

    const columnName = column.name.split('_')[1];

    const columnData: ColDef = {
      headerName: columnName
        ? ColumnHeaderMap.get(columnName)
        : ColumnHeaderMap.get(column.name),
      field: column.name,
      resizable: true,
      editable: column.name !== 'id' && editable,
      hide: column.name.includes('_id'),
      sort: column.name === 'id' ? 'asc' : undefined,
      sortable: true,
      ...additionalProperties,
    };
    return columnData;
  }

  /**
   * Return Ag-Grid ColumnDefs for a tableName
   *
   * @param editable: whether the columns are editable
   * @returns ColDef[]
   */
  public async getColumnDefs(): Promise<ColDef[]> {
    const columns = await apolloClient.getColumns(this.tableName);
    const relationships = await apolloClient.getRelationships(this.tableName);

    /**
     * First we set all columns to selectionType: single.
     * This accounts for multiselect columns that are a relationship.
     * However, they need to be defined as a column for editing.
     * This flags these columns as selectionType: multiple for parser to know.
     */
    const allColumns = columns
      .map(
        (column): TableTypes => ({
          ...column,
          selectionType: CellSelectionType.single,
        }),
      )
      .concat(
        relationships
          // eslint-disable-next-line max-len
          .filter(
            (relationship): boolean =>
              relationship.name.includes('Type') &&
              !relationship.name.includes('aggregate'),
          )
          .map(
            (relationship): TableTypes => ({
              ...relationship,
              selectionType: CellSelectionType.multiple,
            }),
          ),
      );

    const columnDefs = allColumns.map(
      async (column): Promise<ColDef> =>
        ColumnDefiner.defineColumn(column, this.editableColumns, relationships),
    );

    const resolvedDefs = await Promise.all(columnDefs).then(
      (colDefs): ColDef[] => colDefs,
    );

    // Insert the custom buttons to the front of the column definitions
    this.customColumns.forEach((customColumnName): void => {
      resolvedDefs.unshift(CustomButtonColumns[customColumnName]);
    });

    return resolvedDefs;
  }
}
