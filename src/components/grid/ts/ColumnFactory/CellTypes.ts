import { CellType } from '@/types/grid';
import { TreeData } from '@/types/api';
import { listToTree } from '@/common/listToTree';
import { ColDef } from 'ag-grid-community';

/**
 * Here is object to define CellTypes and their properties
 */
const CellTypes = {
  // Text
  [CellType.textCell]: (): ColDef => ({
    valueParser: ({ newValue }: { newValue: string }): string => newValue,
    filter: 'agTextColumnFilter',
  }),
  // Boolean
  [CellType.booleanCell]: (): ColDef => ({
    valueParser: ({ newValue }: { newValue: string }): boolean =>
      newValue === 'true',
    filterFramework: 'SetFilter',
    filterParams: {
      values: ['true', 'false'],
    },
  }),
  // Numeric (Int, double, etc)
  [CellType.numberCell]: (): ColDef => ({
    valueParser: ({ newValue }: { newValue: string }): number =>
      Number(newValue),
    filter: 'agNumberColumnFilter',
  }),
  // Select / dropdown kind
  [CellType.selectCell]: (values: string[]): ColDef => ({
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
  }),
  // Treeview column definition
  async [CellType.treeCell](values: TreeData[]): Promise<ColDef> {
    // @ts-ignore
    const treeData = listToTree(values);
    const treeMap = new Map(
      // @ts-ignore
      values.map((entry): [number, string] => [entry.id, entry.name]),
    );
    return {
      filterFramework: 'TreeviewFilter',
      filterParams: {
        treeData,
        treeIds: values.map((val): string => val.id),
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
    };
  },
  [CellType.aliasCell]: (): ColDef => ({}),
  [CellType.rearrangeCell]: (): ColDef => ({
    cellRendererFramework: 'RearrangeRenderer',
  }),
};

export default CellTypes;
