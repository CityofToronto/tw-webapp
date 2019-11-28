import { GridConfiguration } from '@/types/config';

export const expandAndFit: GridConfiguration = {
  gridInitializedEvent: ({ gridInstance }) => {
    gridInstance.gridApi.sizeColumnsToFit();
    gridInstance.gridApi
      .getRenderedNodes()
      .forEach((node) => node.setExpanded(true));
  },
};
