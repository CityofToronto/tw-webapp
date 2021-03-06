import { RowData } from '@/types/grid';
import { storeInstance } from '@/store';
import GridInstance from '@/components/grid/ts/GridInstance';

import Vue from 'vue';

/**
 * Takes in an error object
 * Then an error bar is displayed
 * Through a Vuetify snackbar
 */
export const dispatchError = (error: Error): never => {
  Vue.$toast(error.message, { type: 'error', position: 'bottom-right' });
  throw new Error(error.message);
};

const fieldsToRemove = ['id', 'group'];

// Converts an object into a string that Hasura understands
export const stringify = (data: RowData, tableID: string): string => {
  const gridInstance = storeInstance.grid.getGridInstance(
    tableID,
  ) as GridInstance;
  const selectedCellFields = gridInstance.columnDefs
    .filter((col) => col.cellType === 'selectCell')
    .map((col) => col.field);

  return Object.entries(data)
    .filter(([, value]): boolean => value !== '') // Remove blank values (usually just id on new row)
    .filter(([key]): boolean => !fieldsToRemove.includes(key))
    .map(([key, value]): string => {
      if (selectedCellFields.includes(key)) {
        return `${key}: ${value !== undefined ? `${value}` : null}`;
      } else if (typeof value === 'string') {
        return `${key}: ${value !== undefined ? `"${value}"` : null}`;
      } else {
        return `${key}: ${value !== undefined ? `${value}` : null}`;
      }
    })
    .join();
};
