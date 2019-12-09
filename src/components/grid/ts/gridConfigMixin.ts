import { GridConfiguration } from '@/types/config';
import _ from 'lodash';

type GridConfigMixin = Pick<
  GridConfiguration,
  | 'gridButtons'
  | 'toolbarItems'
  | 'gridEvents'
  | 'contextMenu'
  | 'gridInitializedEvent'
>;

export const useGridMixin = (
  mixins: GridConfigMixin[],
  grid: GridConfiguration,
) => {
  _.mergeWith(grid, ...mixins, (objValue, srcValue) => {
    if (_.isArray(srcValue)) {
      return [...srcValue, ...(objValue ?? [])];
    }
    if (typeof srcValue === 'function') {
      return (params) => {
        srcValue(params);
        if (typeof objValue === 'function') {
          objValue(params);
        }
      };
    }
  });
  return grid;
};
