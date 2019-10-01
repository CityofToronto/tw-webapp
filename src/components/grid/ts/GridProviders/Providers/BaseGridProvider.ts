import { RowData } from '@/types/grid';
import GridDatasource from '../Datasources/GridDatasource';
import GridInstance from '../../GridInstance';

export default abstract class BaseGridProvider {
  public abstract gridDatasource: GridDatasource;

  abstract addData(
    rowToAdd: { [key: string]: any },
    successCallback?: () => void,
    failCallBack?: () => void,
  ): void;

  /** Function to remove a row from source */
  abstract removeData(
    idToRemove: number,
    successCallback?: () => void,
    failCallBack?: () => void,
  ): void;

  /**
   * In the case of MTM, updating data is not supported as
   * it would unexpectedly affect others.
   */
  abstract updateData(
    rowToUpdate: RowData,
    successCallback?: () => void,
    failCallBack?: () => void,
  ): void;
}
