import {
  GridApi, IFilter, ColumnApi, ProvidedFilterModel,
} from 'ag-grid-community';
import { SetFilter } from 'ag-grid-enterprise';

interface FilterModel {
  values: [];
  filterType: string;
}

/**
 * The AgGrid Set Filter does not like to reflect our filter changes on the GUI .
 * I believe this is a bug and this is our workaround, where we manually update it through
 * the api. Even in examples they are broken.
 */
export const updateFilterModel = (gridApi: GridApi, filterModel: FilterModel[]): void => {
  Object.entries(filterModel)
    .filter(([, value]): boolean => value.filterType === 'set')
    .forEach(([key, value]): void => {
      const filterInstance = gridApi.getFilterInstance(key) as SetFilter;
      filterInstance.selectNothing();
      value.values.forEach((val): void => filterInstance.selectValue(val));
    });
};
