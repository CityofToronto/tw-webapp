import { MergeContext } from './grid';
import { CellClassParams } from '@ag-grid-enterprise/all-modules';

/**
 * This file is specifically for overwriting agGrid type definitions
 */

export type ClassRules = {
  [cssClassName: string]: (params: MergeContext<CellClassParams>) => boolean;
};
