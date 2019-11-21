import { ColDef, ColGroupDef } from 'ag-grid-community';
import apolloClient from '@/apollo';
import { TreeData } from '@/types/api';
import { CellType, RequiredConfig } from '@/types/grid';
import {
  CellParams,
  GridConfiguration,
  CustomColGroupDef,
  CommonCell,
} from '@/types/config';
import { HasuraField } from '@/types/api';
import _ from 'lodash';
import { inDebug } from '@/common/utils';
import cellTypes from './cellTypes';

interface NormalColumn {
  name: string;
  cellType: Exclude<CellType, 'selectCell'>;
}

interface EnumColumn {
  name: string;
  cellType: 'selectCell';
  enumValues: string[];
}

const isGroupColumn = (column: ColDef | ColGroupDef): column is ColGroupDef =>
  (column as ColGroupDef)?.children !== undefined;

export default class ColumnFactory {
  private tableName: string;

  private config: GridConfiguration;

  private columns: HasuraField[] = [];

  private processedColumns: (NormalColumn | EnumColumn)[] = [];

  private columnDefs: (ColDef | CustomColGroupDef)[] = [];

  /**
   * Provides the column definitions for the grid.
   *
   * @param {Table} string enum of tables
   */
  public constructor(config: RequiredConfig) {
    this.tableName = config.tableName;
    this.config = config;
  }

  private addToColumnDefs(columnsToAdd: ColDef[]): void {
    columnsToAdd.forEach((columnToAdd): void => {
      this.columnDefs.unshift(columnToAdd);
    });
  }

  private parseType(column: HasuraField): NormalColumn | EnumColumn {
    const name = column.name;

    const getType = (type: HasuraField['type']) => {
      if (type.kind === 'SCALAR') {
        if (type.name === 'Boolean') {
          return {
            cellType: 'booleanCell',
          };
        }
        if (type.name === 'Int') {
          return {
            cellType: 'numberCell',
          };
        }
        return {
          cellType: 'textCell',
        };
      }
      if (type.kind === 'ENUM') {
        return {
          cellType: 'selectCell',
          enumValues: type.enumValues.map((x) => x.name),
        };
      }
      if (type.kind === 'NON_NULL') {
        return getType(type.ofType);
      }
      return {
        cellType: 'textCell',
      };
    };

    return {
      name,
      ...getType(column.type),
    };
  }

  private processColumns(sortingOrder?: string[]): void {
    // Assign a normal either as a normal column or enum column
    this.processedColumns = this.columns.map((column):
      | NormalColumn
      | EnumColumn => this.parseType(column));
  }

  private getCustomColDef = async (column: CellParams): Promise<ColDef> => {
    switch (column.cellType) {
      // Tree Column requires external data to render
      case 'treeCell': {
        const valueData = await apolloClient.getValuesFromTable<TreeData[]>({
          tableName: column.sourceTableName,
          columns: ['name'],
        });
        return cellTypes[column.cellType](valueData);
      }
      // Select column requires values as string[]
      case 'selectCell': {
        return cellTypes.selectCell(column.enumValues);
      }
      default:
        if (column.cellType) {
          return cellTypes[column.cellType];
        }
        return cellTypes.textCell;
    }
  };

  private async buildColumnDef(column: CellParams): Promise<ColDef> {
    // First get the column information from hasura
    const hasuraColumn = this.processedColumns.find(
      (pColumn) => column.field === pColumn.name,
    );

    // If the column doesn't exist in hasura, then it will be undefined and removed later
    if (hasuraColumn === undefined) {
      return new Promise(() => {});
    }

    const defaultColumnDef: CommonCell & { cellType: CellType } = {
      ...column,
      ...hasuraColumn,
      showInForm: true,
      cellType: column.cellType ?? hasuraColumn.cellType,
      sort: hasuraColumn.name === 'id' ? 'asc' : undefined,
      headerName:
        column.headerName ?? _.startCase(_.lowerCase(hasuraColumn.name)),
      resizable: true,
      editable: false,
      field: column.field,
    };

    const rendererColDef = await this.getCustomColDef(defaultColumnDef);

    const mergedConditional = {
      cellRendererParams: {
        conditional: column?.conditional ?? (() => true),
      },
    };

    return _.merge(defaultColumnDef, mergedConditional, rendererColDef);
  }

  private async defineColumns(
    columns: (CellParams | CustomColGroupDef)[],
  ): Promise<void> {
    // Map over the columns

    const columnPromises = columns.map(async (column) => {
      if (isGroupColumn(column)) {
        // If the column definition is a group, define it's children
        const children = await Promise.all(
          column.children.map((childColumn) =>
            this.buildColumnDef(childColumn),
          ),
        );
        return {
          ...column,
          children,
        } as CustomColGroupDef;
      }
      return this.buildColumnDef(column);
    });

    this.columnDefs = await Promise.all(columnPromises);
  }

  public async getColumnDefs() {
    const overriddenColDefs = this.config.overrideColumnDefinitions ?? [];

    this.columns = await apolloClient.getColumns(this.tableName);

    /**
     * This parses and assigns the column type
     * and sorts it to match the configuration
     */
    this.processColumns(this.config.columnOrder);

    /**
     * This assigns column definitions to the columns which is then processed
     * by Ag-Grid to build the table.
     */
    await this.defineColumns(overriddenColDefs);

    // Adds additional column definitions to the front of the array
    if (this.config.gridButtons) {
      this.addToColumnDefs(this.config.gridButtons);
    }

    // If we are in debug, it will display all columns
    if (inDebug()) {
      const columnNames = this.columnDefs
        .map((col) =>
          isGroupColumn(col)
            ? col.children.map((child) => child.field)
            : col.field,
        )
        .flat();

      const debugFields = this.columns
        .filter((col) => !columnNames.includes(col.name))
        .map((col) => ({ field: col.name }));

      this.columnDefs.push(...debugFields);
    }

    return this.columnDefs;
  }
}
