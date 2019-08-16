import { ColDef, ICellRendererParams } from 'ag-grid-community';
import _ from 'lodash';
import { TableTypes } from '@/apollo/types';
import apolloClient from '@/apollo';

interface ColDefiner {
  getColumnDefs(): Promise<ColDef[]>;
}

export type ColumnTypes = 'booleanColumn' | 'numberColumn' | 'textColumn' | 'selectColumn';
export enum CustomColumn {
  Edit = 'Edit',
  Delete = 'Delete'
}

interface CustomDef extends ColDef {
  colType: ColumnTypes;
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
  [CustomColumn.Delete]: {
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
export class ColumnDefiner implements ColDefiner {
  private tableName: string;

  private editableColumns: boolean;

  private customColumns: CustomColumn[];

  public constructor(tableName: string, editableColumns: boolean, customColumns) {
    this.tableName = tableName;
    this.editableColumns = editableColumns;
    this.customColumns = customColumns;
  }


  /**
   *  This function will output additional properties for each column type.
   *  This is needed as these are unique for the column types
   *  colType is defined here to be used in the DynamicForm.vue to render
   *  the correct form input
   */
  private static async getColumnProperties(
    column: TableTypes, relationships: TableTypes[],
  ): Promise<ColDef> {
    const columnTypes = {
      textColumn: (): CustomDef => ({
        valueParser: ({ newValue }: {newValue: string}): string => newValue,
        filter: 'agTextColumnFilter',
        colType: 'textColumn',
      }),
      booleanColumn: (): CustomDef => ({
        valueParser: ({ newValue }: {newValue: string}): boolean => newValue === 'true',
        filter: 'agSetColumnFilter',
        filterParams: {
          debounceMs: 200,
          values: [true, false],
        },
        colType: 'booleanColumn',
      }),
      numberColumn: (): CustomDef => ({
        valueParser: ({ newValue }: {newValue: string}): number => Number(newValue),
        filter: 'agNumberColumnFilter',
        colType: 'numberColumn',
      }),
      // selectColumn(values: string[]): CustomDef {
      //   return {
      //     filter: 'agSetColumnFilter',
      //     filterParams: {
      //       debounceMs: 200,
      //       values,
      //     },
      //     valueParser: ({ newValue }: {newValue: string}): string => newValue,
      //     cellEditor: 'agRichSelectCellEditor',
      //     cellEditorParams: {
      //       values,
      //       cellHeight: 41,
      //     },
      //     colType: 'selectColumn',
      //   };
      // },
      async selectColumn(values: string[]): CustomDef {
        return {
          filter: 'agSetColumnFilter',
          filterParams: {
            debounceMs: 200,
            values,
          },
          valueParser: ({ newValue }: {newValue: string}): string => newValue,
          cellEditorFramework: 'TreeSelectEditor',
          cellEditorParams: {
            list: await apolloClient.getHeirarchy('HEIR_TEST'),
            cellHeight: 41,
          },
          colType: 'selectColumn',
        };
      },
    };

    const relationshipNames = relationships.map((col): string => col.name);
    /**
     * First check if it is a select column
     * tradeType to TRADE_TYPE, where TRADE_TYPE is defined in Hasura
     */
    const columnNameUpperSnakeCase = _.snakeCase(column.name).toUpperCase();
    if (relationshipNames.includes(columnNameUpperSnakeCase)) {
      const values = await apolloClient.getValidTypes(`${columnNameUpperSnakeCase}S`);
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

  /**
   * This defines the columns, it determines if it is a number column,
   * a boolean, a text field or selection field
   * If selection, it fetches the values from the value list
   */
  private static async defineColumn(
    column: TableTypes, editable: boolean, relationships: TableTypes[],
  ): Promise<ColDef> {
    const additionalProperties = await ColumnDefiner.getColumnProperties(column, relationships);

    const columnData: ColDef = {
      headerName: HEADERS.get(column.name),
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

    const columnDefs = columns.map(
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
