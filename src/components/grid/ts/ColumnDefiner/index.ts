import { getDefaultColDef } from '@/config/defaults';
import { GRID_CONFIG } from '@/config';
import { ColDef } from 'ag-grid-community';
import apolloClient from '@/apollo';
import { TreeData } from '@/types/api';
import ButtonColumns from './GridButtons';
import { CellType, ColumnButton } from '@/types/grid';
import ColumnHeaderMap from './ColumnHeaderMap';
import CustomCellTypes from './CustomCellTypes';
import { CellParams, GridConfiguration } from '@/types/config';
import { HasuraField } from '@/apollo/types';
import { capitalize } from '@/common/utils';

interface ProcessedColumn {
  name: string;
  cellType: CellType;
}

export default class ColumnDefiner {
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
  public constructor(tableName: string) {
    this.tableName = tableName;
    const config = GRID_CONFIG.get(this.tableName);
    this.config = {
      ...getDefaultColDef(config ? config.gridType : undefined),
      ...config,
    };
  }

  private omitColumns(columnsToOmit: string[]): void {
    this.columns = this.columns.filter(
      (column): boolean => !columnsToOmit.includes(column.name),
    );
  }

  private addToColumnDefs(columnsToAdd: ColumnButton[]): void {
    columnsToAdd.forEach((columnToAdd): void => {
      this.columnDefs.unshift(ButtonColumns[columnToAdd]);
    });
  }

  private parseType(
    column: HasuraField,
  ): { cellType: CellType; enumValues?: string[] } {
    // Type is defined in two places depending if nullable
    const type = column.type.ofType
      ? column.type.ofType.name
      : column.type.name;
    if (column.type.ofType.kind === 'ENUM') {
      return {
        cellType: CellType.selectCell,
        enumValues: column.type.ofType.enumValues,
      };
    }
    switch (type) {
      case 'Int':
      case 'numeric':
      case 'bigint':
        return { cellType: CellType.numberCell };
      case 'Boolean':
        return { cellType: CellType.booleanCell };
      default:
        return { cellType: CellType.textCell };
    }
  }

  private processColumns(): void {
    this.processedColumns = this.columns.map(
      (column): ProcessedColumn => {
        return {
          name: column.name,
          ...this.parseType(column),
        };
      },
    );
  }

  private getCustomColDef = async (column: CellParams): Promise<ColDef> => {
    switch (column.cellType) {
      // Tree Column requires external data to render
      case CellType.treeCell: {
        const valueData = await apolloClient.getValuesFromTable<TreeData[]>({
          tableName: column.sourceTableName,
          columns: ['name'],
        });
        return CustomCellTypes[column.cellType](valueData);
      }

      case CellType.selectCell: {
        return CustomCellTypes[column.cellType](column.enumValues);
      }
      default:
        if (column.cellType) {
          return CustomCellTypes[column.cellType]();
        }
        return CustomCellTypes[CellType.textCell]();
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
          ...this.config.defaultColDef,
          cellType: column.cellType,
          // Attempt the map the name, if not capitalize the name field
          headerName: ColumnHeaderMap.get(column.name)
            ? ColumnHeaderMap.get(column.name)
            : capitalize(column.name),
          field: column.name,
          editable: column.name !== 'id',
          sort: column.name === 'id' ? 'asc' : undefined,
          ...overrideColDef,
        };

        return {
          ...colDef,
          ...(await this.getCustomColDef(colDef as CellParams)),
          ...overrideColDef,
        };
      },
    );
    this.columnDefs = await Promise.all(promiseOfColDef);
  }

  public async getColumnDefs(): Promise<ColDef[]> {
    this.columns = await apolloClient.getColumns(this.tableName);

    // Omit columns defined in config
    if (GRID_CONFIG.has(this.tableName)) {
      if (this.config.omittedColumns) {
        this.omitColumns(this.config.omittedColumns);
      }
    }

    /**
     * This parses and assigns the column type
     */
    this.processColumns();

    /**
     * This assigns column definitions to the columns which is then processed
     * by Ag-Grid to build the table.
     */
    await this.defineColumns(this.processedColumns);

    // Adds additional column definitions to the front of the array
    if (this.config.columnButtons) {
      this.addToColumnDefs(this.config.columnButtons);
    }

    return this.columnDefs;
  }
}
