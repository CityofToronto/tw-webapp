import { TreeData } from '@/types/api';
import { listToTree } from '@/common/listToTree';
import { ColDef } from 'ag-grid-community';
import { CellType } from '@/types/grid';

type ColDefType =
  | ColDef
  | ((...args: any[]) => ColDef)
  | ((...args: any[]) => Promise<ColDef>);

/**
 * Here is object to define CellTypes and their properties
 */
const textCell: ColDefType = {
  valueParser: ({ newValue }: { newValue: string }): string => newValue,
  filter: 'agTextColumnFilter',
};

const booleanCell: ColDefType = {
  valueParser: ({ newValue }: { newValue: string }): boolean =>
    newValue === 'true',
  filterFramework: 'SetFilter',
  filterParams: {
    values: ['true', 'false'],
  },
};

const numberCell: ColDefType = {
  valueParser: ({ newValue }: { newValue: string }): number => Number(newValue),
  filter: 'agNumberColumnFilter',
};

const selectCell: ColDefType = (values: string[]) => ({
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
});

const treeCell: ColDefType = async (values: TreeData[]) => {
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
};

const rearrangeCell = {
  cellRendererFramework: 'RearrangeRenderer',
};

export default {
  textCell,
  booleanCell,
  numberCell,
  selectCell,
  treeCell,
  rearrangeCell,
};
