import { ColDef } from 'ag-grid-community';
import apolloClient from '@/apollo';
import { TreeData } from '@/types/api';
import { CellType, RequiredConfig } from '@/types/grid';
import CellTypes from './CellTypes';
import { CellParams, GridConfiguration } from '@/types/config';
import { HasuraField } from '@/types/api';
import _ from 'lodash';

interface ProcessedColumn {
  name: string;
  cellType: CellType;
  enumValues?: string[];
}

export default class ColumnFactory {
  private tableName: string;

  private config: GridConfiguration;

  private columns: HasuraField[] = [];

  private processedColumns: ProcessedColumn[] = [];

  private columnDefs: ColDef[] = [];

  /**
   * Provides the column definitions for the grid.
   *
   * @param {Table} string enum of tables
   */
  public constructor(config: RequiredConfig) {
    this.tableName = config.tableName;
    this.config = config;
  }

  private omitColumns(columnsToOmit: string[]): void {
    this.columns = this.columns.filter(
      (column): boolean => !columnsToOmit.includes(column.name),
    );
  }

  private addToColumnDefs(columnsToAdd: ColDef[]): void {
    columnsToAdd.forEach((columnToAdd): void => {
      this.columnDefs.unshift(columnToAdd);
    });
  }

  private parseType(
    column: HasuraField,
  ): { cellType: CellType; enumValues?: string[] } {
    // Type is defined in two places depending if nullable
    const type = column.type.ofType
      ? column.type.ofType.name
      : column.type.name;

    const isEnum = column.type.ofType
      ? column.type.ofType.kind === 'ENUM'
      : column.type.kind === 'ENUM';

    if (isEnum) {
      return {
        cellType: 'selectCell',
        enumValues: column.type.ofType.enumValues,
      };
    }
    switch (type) {
      case 'Int':
      case 'numeric':
      case 'bigint':
        return { cellType: 'numberCell' };
      case 'Boolean':
        return { cellType: 'numberCell' };
      default:
        return { cellType: 'textCell' };
    }
  }

  private processColumns(sortingOrder?: string[]): void {
    // Parse Types
    this.processedColumns = this.columns.map(
      (column): ProcessedColumn => {
        const additionalProperties = this.parseType(column);
        return {
          name: column.name,
          ...additionalProperties,
        };
      },
    );
    // Rearrange Columns if sorting array is defined
    if (sortingOrder) {
      this.processedColumns.sort(
        (a, b) => sortingOrder.indexOf(a.name) - sortingOrder.indexOf(b.name),
      );
    }
  }

  private getCustomColDef = async (column: CellParams): Promise<ColDef> => {
    switch (column.cellType) {
      // Tree Column requires external data to render
      case 'treeCell': {
        const valueData = await apolloClient.getValuesFromTable<TreeData[]>({
          tableName: column.sourceTableName,
          columns: ['name'],
        });
        return CellTypes[column.cellType](valueData);
      }
      // Select column requires values as string[]
      case 'selectCell': {
        return CellTypes.selectCell(
          column.enumValues.map((enumVal) => enumVal.name),
        );
      }
      default:
        if (column.cellType) {
          return CellTypes[column.cellType];
        }
        return CellTypes.textCell;
    }
  };

  private async defineColumns(columns: ProcessedColumn[]): Promise<void> {
    const overriddenColDefs = this.config.overrideColumnDefinitions || [];

    const promiseOfColDef = columns.map(
      async (column): Promise<ColDef> => {
        const overrideColDef = overriddenColDefs.find(
          (colDef: ColDef): boolean => colDef.field === column.name,
        ) as CellParams;

        const colDef = {
          showInForm: true,
          ...this.config.defaultColDef,
          cellType: column.cellType,
          enumValues: column.enumValues,
          // Attempt the map the name, if not capitalize the name field
          headerName: _.startCase(_.lowerCase(column.name)),
          field: column.name,
          resizable: true,
          editable: false,
          ...overrideColDef,
        };

        // This merges the conditional into the cellRendererParams for access in cell renderers
        const combinedDef = {
          ...colDef,
          ...(await this.getCustomColDef(colDef as CellParams)),
          ...overrideColDef,
        };
        const mergedConditional = {
          cellRendererParams: {
            conditional:
              (overrideColDef && overrideColDef.conditional) || (() => true),
          },
        };

        return _.merge(combinedDef, mergedConditional);
      },
    );
    this.columnDefs = await Promise.all(promiseOfColDef);
  }

  public async getColumnDefs(): Promise<ColDef[]> {
    this.columns = await apolloClient.getColumns(this.tableName);

    // Omit columns defined in config
    if (this.config.omittedColumns) {
      this.omitColumns(this.config.omittedColumns);
    }
    /**
     * This parses and assigns the column type
     * and sorts it to match the configuration
     */
    this.processColumns(this.config.columnOrder);

    /**
     * This assigns column definitions to the columns which is then processed
     * by Ag-Grid to build the table.
     */
    await this.defineColumns(this.processedColumns);

    // Adds additional column definitions to the front of the array
    if (this.config.gridButtons) {
      this.addToColumnDefs(this.config.gridButtons);
    }

    return this.columnDefs;
  }
}
