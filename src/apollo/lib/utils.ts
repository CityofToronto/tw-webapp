/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryError, RowData } from '@/apollo/types';
import { storeInstance } from '@/store';
import { NotificationPosition } from '@/store/modules/notification';

/**
 * Takes in an error object
 * Then an error bar is displayed
 * Through a Vuetify snackbar
 */
export const dispatchError = (error: QueryError): never => {
  storeInstance.notification.pushNotification({
    message: error.message,
    color: 'error',
    position: [NotificationPosition.Top],
  });
  console.error(error);
  throw new Error(error.message);
};

export const stringify = (data: RowData): string =>
  Object.entries(data)
    .filter(([, value]): boolean => value !== '') // Remove blank values (usually just id on new row)
    .filter(([key]): boolean => key !== 'group')
    .map(([key, value]): string => {
      return `${key}: ${value ? `"${value}"` : null}`;
    })
    .join();
