/* eslint-disable @typescript-eslint/no-explicit-any */
import { RowData } from '@/apollo/types';
import { storeInstance } from '@/store';
import { NotificationPosition } from '@/store/modules/notification';
import GridInstance from '@/components/grid/ts/GridInstance';
import { ColDef } from 'ag-grid-community';
import { CellType } from '@/types/grid';

/**
 * Takes in an error object
 * Then an error bar is displayed
 * Through a Vuetify snackbar
 */
export const dispatchError = (error: Error): never => {
  storeInstance.notification.pushNotification({
    message: error.message,
    color: 'error',
    position: [NotificationPosition.Top],
  });
  console.error(error);
  throw new Error(error.message);
};

const fieldsToRemove = ['id', 'group'];

// Converts an object into a string that Hasura understands
export const stringify = (data: RowData, tableName: string): string => {
  const gridInstance = storeInstance.grid.getGridInstance(
    tableName,
  ) as GridInstance;
  const selectedCellFields = gridInstance.columnDefs
    .filter((col) => col.cellType === CellType.selectCell)
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
