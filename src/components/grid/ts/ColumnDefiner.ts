import { ColDef, ICellRendererParams } from 'ag-grid-community';
import _ from 'lodash';
import { TableTypes } from '@/apollo/types';
import apolloClient from '@/apollo';
import { TreeData } from '@/types/api';
import { listToTree } from '@/common/listToTree';
import { CellSelectionType, ColumnTypes, CustomColumn } from '@/types/grid';

interface CustomColDef extends ColDef {
  colType: ColumnTypes;
  selectionType: CellSelectionType;
}

export const HEADERS = new Map([
  ['id', 'ID'],
  ['procedureName', 'Procedure Name'],
  ['shutDown', 'Shut down?'],
  ['workType', 'Work Type'],
  ['activityType', 'Activity Type'],
  ['wrenchTime', 'Wrench Time (hr)'],
  ['action', 'Recommended Action'],
  ['tradeType', 'Trade Type'],
  ['tradeQuantity', 'Quantity of Trade'],
  ['utilization', 'Wrench Time Utilization (%)'],
  ['description', 'Description'],
]);

const customColumns: { [key in CustomColumn]: ColDef } = {
  [CustomColumn.Drag]: {
    dndSource: true,
    filter: false,
    sortable: false,
    resizable: false,
    lockPosition: true,
    pinned: 'left',
    suppressMenu: true,
    maxWidth: 40,
    width: 40,
    minWidth: 40,
    cellClass: 'thin-column',
    cellRendererFramework: 'GridButton',
    cellRendererParams: {
      icon: 'drag_handle',
      clickFunction: (): void => {},
    },
  },
  [CustomColumn.Unlink]: {
    filter: false,
    sortable: false,
    resizable: false,
    lockPosition: true,
    pinned: 'left',
    suppressMenu: true,
    maxWidth: 40,
    width: 40,
    minWidth: 40,
    cellClass: 'thin-column',
    cellRendererFramework: 'GridButton',
    cellRendererParams: {
      icon: 'link_off',
      clickFunction: (params: ICellRendererParams): void => {
        params.context.componentParent.removeEntry(params.node);
        params.api.clearFocusedCell();
      },
    },
  },
  [CustomColumn.Edit]: {
    headerName: '',
    colId: 'params',
    width: 40,
    cellRendererFramework: 'GridButton',
    cellRendererParams: {
      icon: 'create',
      clickFunction: (params: ICellRendererParams): void => {
        params.context.componentParent.launchFormEditor(params.node);
        params.api.clearFocusedCell();
      },
    },
    lockPosition: true,
    pinned: 'left',
    suppressMenu: true,
    maxWidth: 40,
    minWidth: 40,
    cellClass: 'thin-column',
  },
};

/**
 * This class takes in a column
 */
export class ColumnDefiner {
  private tableName: string;

  private editableColumns: boolean;

  private customColumns: CustomColumn[];

  public constructor(tableName: string, editableColumns: boolean, customColumnsToAdd: CustomColumn[]) {
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
  private static async getColumnProperties(column: TableTypes, relationships: TableTypes[]): Promise<ColDef> {
    /**
     * Here is object of possible columnTypes and their defined properties
     */
    const columnTypes = {
      // Text Column
      [ColumnTypes.textColumn]: (): CustomColDef => ({
        valueParser: ({ newValue }: {newValue: string}): string => newValue,
        filter: 'agTextColumnFilter',
        colType: ColumnTypes.textColumn,
        selectionType: CellSelectionType.single,
      }),
      // Boolean Column
      [ColumnTypes.booleanColumn]: (): CustomColDef => ({
        valueParser: ({ newValue }: {newValue: string}): boolean => newValue === 'true',
        filterFramework: 'SetFilter',
        filterParams: {
          values: ['true', 'false'],
        },
        colType: ColumnTypes.booleanColumn,
        selectionType: CellSelectionType.single,
      }),
      // Numeric column (Int, double, etc)
      [ColumnTypes.numberColumn]: (): CustomColDef => ({
        valueParser: ({ newValue }: {newValue: string}): number => Number(newValue),
        filter: 'agNumberColumnFilter',
        colType: ColumnTypes.numberColumn,
        selectionType: CellSelectionType.single,
      }),
      // Dropdown kind of column
      [ColumnTypes.selectColumn]: (values: string[], selectionType: CellSelectionType): CustomColDef => ({
        filterFramework: 'SetFilter',
        filterParams: {
          values,
        },
        valueParser: ({ newValue }: {newValue: string}): string => newValue,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          values,
          cellHeight: 41,
        },
        colType: ColumnTypes.selectColumn,
        selectionType,
      }),
      // Treeview column definition
      async [ColumnTypes.treeColumn](
        values: TreeData[],
        selectionType: CellSelectionType,
      ): Promise<CustomColDef> {
        const treeData = listToTree(values);
        const treeMap = new Map(values.map((entry): [number, string] => [entry.id, entry.name]));
        return {
          filterFramework: 'TreeviewFilter',
          filterParams: {
            treeData,
            treeIds: values.map((val): number => val.id),
          },
          valueParser: ({ newValue }: {newValue: string}): string => newValue,
          cellEditorFramework: 'TreeviewEditor',
          cellEditorParams: {
            treeData,
          },
          cellRendererFramework: 'TreeviewRenderer',
          cellRendererParams: {
            treeMap,
          },
          colType: ColumnTypes.treeColumn,
          selectionType,
        };
      },
    };

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
      columnNameUpperSnakeCase = _.snakeCase(column.name.split('_')[1]).toUpperCase();
    } else {
      columnNameToCheck = _.snakeCase(column.name).toUpperCase();
      columnNameUpperSnakeCase = _.snakeCase(column.name).toUpperCase();
    }

    // If this passes, then the column is a select or tree column
    if (relationshipNames.includes(columnNameToCheck)) {
      const tableFields = await apolloClient.getColumns(`${columnNameUpperSnakeCase}`);
      // If value list table has a parent column, it is tree, if not it is a simple select
      if (tableFields.map((field): string => field.name).includes('parent')) {
        const treeValues = await apolloClient
          .getValuesFromTable<TreeData[]>(columnNameUpperSnakeCase, ['id', 'parent', 'name']);
        return columnTypes[ColumnTypes.treeColumn](treeValues, column.selectionType);
      }
      const dropdownValues = await apolloClient
        .getValuesFromTable<{name: string}[]>(columnNameUpperSnakeCase, ['name']);
      return columnTypes[ColumnTypes.selectColumn](dropdownValues.map((val): string => val.name), column.selectionType);
    }

    // These are basic column types
    const typeName = column.type.ofType ? column.type.ofType.name : column.type.name;
    if (typeName === 'Int' || typeName === 'numeric') {
      // Return numeric
      return columnTypes[ColumnTypes.numberColumn]();
    }
    if (typeName === 'Boolean') {
      // Return boolean
      return columnTypes[ColumnTypes.booleanColumn]();
    }
    // Return any other as text column
    return columnTypes[ColumnTypes.textColumn]();
  };

  /**
   * This defines the columns, it determines if it is a number column,
   * a boolean, a text field or selection field
   * If selection, it fetches the values from the value list
   */
  private static async defineColumn(
    column: TableTypes, editable: boolean, relationships: TableTypes[],
  ): Promise<ColDef> {
    const additionalProperties = await ColumnDefiner.getColumnProperties(column, relationships);

    const columnName = column.name.split('_')[1];

    const columnData: ColDef = {
      headerName: columnName ? HEADERS.get(columnName) : HEADERS.get(column.name),
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
      .map((column): TableTypes => ({ ...column, selectionType: CellSelectionType.single }))
      .concat(
        relationships
          // eslint-disable-next-line max-len
          .filter((relationship): boolean => relationship.name.includes('Type') && !relationship.name.includes('aggregate'))
          .map((relationship): TableTypes => ({
            ...relationship,
            selectionType: CellSelectionType.multiple,
          })),
      );

    const columnDefs = allColumns.map(
      async (column): Promise<ColDef> => ColumnDefiner.defineColumn(column, this.editableColumns, relationships),
    );

    const resolvedDefs = await Promise.all(columnDefs)
      .then((colDefs): ColDef[] => colDefs);

    // Insert the custom buttons to the front of the column definitions
    this.customColumns.forEach((customColumnName): void => {
      resolvedDefs.unshift(customColumns[customColumnName]);
    });

    return resolvedDefs;
  };
}
