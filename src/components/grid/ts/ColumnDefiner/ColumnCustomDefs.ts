import { CustomColumn } from '@/types/grid';
import { ColDef, ICellRendererParams } from 'ag-grid-community';

const ButtonColumns: { [key in CustomColumn]: ColDef } = {
  [CustomColumn.Drag]: {
    dndSource: true,
    filter: false,
    sortable: false,
    resizable: false,
    lockPosition: true,
    pinned: 'left',
    suppressMenu: true,
    maxWidth: 40,
    width: 40,
    minWidth: 40,
    cellClass: 'thin-column',
    cellRendererFramework: 'GridButton',
    cellRendererParams: {
      icon: 'drag_handle',
      clickFunction: (): void => {},
    },
  },
  [CustomColumn.Unlink]: {
    filter: false,
    sortable: false,
    resizable: false,
    lockPosition: true,
    pinned: 'left',
    suppressMenu: true,
    maxWidth: 40,
    width: 40,
    minWidth: 40,
    cellClass: 'thin-column',
    cellRendererFramework: 'GridButton',
    cellRendererParams: {
      icon: 'link_off',
      clickFunction: (params: ICellRendererParams): void => {
        params.context.componentParent.removeEntry(params.node);
        params.api.clearFocusedCell();
      },
    },
  },
  [CustomColumn.Edit]: {
    headerName: '',
    colId: 'params',
    width: 40,
    cellRendererFramework: 'GridButton',
    cellRendererParams: {
      icon: 'create',
      clickFunction: (params: ICellRendererParams): void => {
        params.context.componentParent.launchFormEditor(params.node);
        params.api.clearFocusedCell();
      },
    },
    lockPosition: true,
    pinned: 'left',
    suppressMenu: true,
    maxWidth: 40,
    minWidth: 40,
    cellClass: 'thin-column',
  },
};

export default ButtonColumns;
