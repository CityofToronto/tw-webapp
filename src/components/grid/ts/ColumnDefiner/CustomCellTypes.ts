import { ColumnTypes, CellSelectionType, CustomColDef } from '@/types/grid';
import { TreeData } from '@/types/api';
import { listToTree } from '@/common/listToTree';

/**
 * Here is object to define CustomCellTypes and their properties
 */
const CustomCellTypes = {
  // Text Column
  [ColumnTypes.textColumn]: (): CustomColDef => ({
    valueParser: ({ newValue }: { newValue: string }): string => newValue,
    filter: 'agTextColumnFilter',
    colType: ColumnTypes.textColumn,
    selectionType: CellSelectionType.single,
  }),
  // Boolean Column
  [ColumnTypes.booleanColumn]: (): CustomColDef => ({
    valueParser: ({ newValue }: { newValue: string }): boolean =>
      newValue === 'true',
    filterFramework: 'SetFilter',
    filterParams: {
      values: ['true', 'false'],
    },
    colType: ColumnTypes.booleanColumn,
    selectionType: CellSelectionType.single,
  }),
  // Numeric column (Int, double, etc)
  [ColumnTypes.numberColumn]: (): CustomColDef => ({
    valueParser: ({ newValue }: { newValue: string }): number =>
      Number(newValue),
    filter: 'agNumberColumnFilter',
    colType: ColumnTypes.numberColumn,
    selectionType: CellSelectionType.single,
  }),
  // Dropdown kind of column
  [ColumnTypes.selectColumn]: (
    values: string[],
    selectionType: CellSelectionType,
  ): CustomColDef => ({
    filterFramework: 'SetFilter',
    filterParams: {
      values,
    },
    valueParser: ({ newValue }: { newValue: string }): string => newValue,
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
    const treeMap = new Map(
      values.map((entry): [number, string] => [entry.id, entry.name]),
    );
    return {
      filterFramework: 'TreeviewFilter',
      filterParams: {
        treeData,
        treeIds: values.map((val): number => val.id),
      },
      valueParser: ({ newValue }: { newValue: string }): string => newValue,
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
  [ColumnTypes.aliasColumn](
    value
  ): {

  },
};

export default CustomCellTypes;
