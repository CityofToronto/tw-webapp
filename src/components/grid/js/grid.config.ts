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

export const columnTypes = {
  textColumn: {
    valueParser: 'newValue',
    filter: 'agTextColumnFilter',
  },
  booleanColumn: {
    valueParser: 'newValue === "true"',
    filter: 'agSetColumnFilter',
    filterParams: {
      debounceMs: 200,
      values: [true, false],
    },
  },
  numberColumn: {
    valueParser: 'Number(newValue)',
    filter: 'agNumberColumnFilter',
  },
};

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
