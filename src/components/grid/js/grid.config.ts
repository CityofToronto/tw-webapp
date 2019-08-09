import { ColDef } from 'ag-grid-community';

export const sideBar = {
  toolPanels: [
    {
      id: 'filters',
      labelDefault: 'Filters',
      labelKey: 'filters',
      iconKey: 'filter',
      toolPanel: 'agFiltersToolPanel',
    },
  ],
  defaultToolPanel: '',
};

interface ColumnTypes {
  [key: string]: ColDef,
}



export const rowModelType = 'serverSide';
// Number of rows in a block
export const cacheBlockSize = 75;
// Number of blocks in the cache
// Total rows cached = cacheBlockSize * maxBlocks
export const maxBlocksInCache = 5;

export const validTables = [
  'activity',
  'legislation',
  'trade',
];

export const editColumn = {
  headerName: '',
  colId: 'params',
  width: 40,
  cellRendererFramework: 'ButtonEdit',
  lockPosition: true,
  pinned: 'left',
  suppressMenu: true,
  maxWidth: 40,
  minWidth: 40,
  cellClass: 'thin-column',
};
