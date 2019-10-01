import GridInstance from '@/components/grid/ts/GridInstance';
import { storeInstance } from '@/store';

export const onDropUnassignedAssets = (
  event: DragEvent,
  gridInstance: GridInstance,
) => {
  // Null check
  if (event.dataTransfer) {
    const eventData = JSON.parse(event.dataTransfer.getData('text/plain'));

    const rowData = {
      id: eventData.asset_id,
      role_id: null,
    };

    gridInstance.updateRows({
      rowsToUpdate: [rowData],
      successCallback: () => {
        storeInstance.grid.refreshAllGridInstances();
      },
    });
  }
};
