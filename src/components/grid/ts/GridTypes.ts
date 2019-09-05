/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { GridType, CustomColumn } from '@/types/grid';
import { QueryType } from '@/types/api';

export const getComponentProperties = (
  gridType: GridType,
  tableName: string,
) => {
  /**
   * These are pre-defined configurations of grids
   * Options are of the enum GridType
   */
  const getComponentProps = (): {
    toolbarProps: object;
    gridProps?: object;
  } => {
    const props = {
      [GridType.Full]: {
        toolbarProps: {
          controls: [
            'addRow',
            'cloneRow',
            'removeRow',
            'fitColumns',
            'sizeColumns',
            'togglePanel',
          ],
        },
        gridProps: {
          queryType: QueryType.Direct,
          autoHeight: false,
          showSideBar: true,
          pagination: true,
        },
      },
      [GridType.OneToMany]: {
        toolbarProps: {
          controls: [
            'addRow',
            'cloneRow',
            'removeRow',
            'fitColumns',
            'sizeColumns',
          ],
        },
        gridProps: {
          queryType: QueryType.OneToMany,
        },
      },
      [GridType.ManyToMany]: {
        toolbarProps: {
          controls: ['editLinks', 'fitColumns', 'sizeColumns'],
        },
        gridProps: {
          queryType: QueryType.ManyToMany,
          editable: false,
          customColumns: [CustomColumn.Unlink],
        },
      },
      [GridType.DragTo]: {
        gridComponent: () => import('../DragGridComponent.vue'),
        gridTitle: `Linked ${tableName}`,
        toolbarProps: {
          controls: ['fitColumns', 'sizeColumns'],
        },
        gridProps: {
          queryType: QueryType.ManyToMany,
          autoHeight: false,
          draggable: true,
          customColumns: [CustomColumn.Unlink],
        },
      },
      [GridType.DragFrom]: {
        gridTitle: `All ${tableName}`,
        toolbarProps: {
          controls: ['addRow', 'cloneRow', 'fitColumns', 'sizeColumns'],
        },
        gridProps: {
          queryType: QueryType.Direct,
          autoHeight: false,
          draggable: true,
          pagination: true,
          customColumns: [CustomColumn.Drag],
        },
      },
      [GridType.Tree]: {
        gridComponent: () => import('../TreeGrid.vue'),
        gridTitle: `${tableName}`,
        toolbarProps: {
          controls: ['addRow', 'cloneRow', 'fitColumns', 'sizeColumns'],
        },
        gridProps: {
          showSidebar: false,
          autoHeight: false,
          draggable: false,
          editable: true,
          pagination: false,
          queryType: QueryType.Direct,
        },
      },
    };
    return props[gridType];
  };

  const componentProps = getComponentProps();

  const defaultProps = {
    gridComponent: () => import('../GridComponent.vue'),
    gridTitle: tableName,
    ...componentProps,
    toolbarProps: {
      ...componentProps.toolbarProps,
    },
    gridProps: {
      editable: true,
      showSidebar: false,
      autoHeight: true,
      draggable: false,
      pagination: false,
      customColumns: [CustomColumn.Edit],
      ...componentProps.gridProps,
    },
  };

  return defaultProps;
};
