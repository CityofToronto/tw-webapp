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

export const rowModelType = 'serverSide';
// Number of rows in a block
export const cacheBlockSize = 75;
/*
 * Number of blocks in the cache
 * Total rows cached = cacheBlockSize * maxBlocks
 */
export const maxBlocksInCache = 5;
