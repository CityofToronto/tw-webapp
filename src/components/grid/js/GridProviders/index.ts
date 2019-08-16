import { IServerSideDatasource } from 'ag-grid-community';
import { RowData } from '@/apollo/types';

export { DirectProvider } from './DirectProvider';
export { OTMProvider } from './OTMProvider';
export { MTMProvider } from './MTMProvider';

export enum GridProviders { Direct, OneToMany, ManyToMany }
/** A GridProvider is a class that communicates between a backend and Ag-Grid */
export interface GridProvider {
  gridDatasource: IServerSideDatasource;

  addData(rowToAdd: RowData,
    successCallback?: () => void,
    failCallBack?: () => void,
  ): void;

  /** Function to remove a row from source */
  removeData(
    idToRemove: number,
    successCallback?: () => void,
    failCallBack?: () => void
  ): void;

  updateData(
    rowToUpdate: RowData,
    successCallback?: () => void,
    failCallBack?: () => void
  ): void;
};
