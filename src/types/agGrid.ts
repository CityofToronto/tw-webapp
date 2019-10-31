import { MergeContext } from './grid';
import { CellClassParams } from 'ag-grid-community';

/**
 * This file is specifically for overwriting agGrid type definitions
 */

export type ClassRules = {
  [cssClassName: string]: (params: MergeContext<CellClassParams>) => boolean;
};
