import { ColumnButton } from '@/types/grid';
import { ColDef, ICellRendererParams } from 'ag-grid-community';

const ButtonColumns: { [key in ColumnButton]: ColDef } = {
  [ColumnButton.Drag]: {
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
  [ColumnButton.Unlink]: {
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
  [ColumnButton.Edit]: {
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
  [ColumnButton.AddTree]: {
    headerName: '',
    colId: 'addtree',
    width: 40,
    cellRendererFramework: 'GridButton',
    cellRendererParams: {
      icon: 'keyboard_tab',
      clickFunction: (params: ICellRendererParams): void => {
        params.context.componentParent.launchFormAdder(params.node);
        params.api.clearFocusedCell();
      },
    },
    lockPosition: true,
    pinned: true,
    suppressMenu: true,
    maxWidth: 40,
    minWidth: 40,
    cellClass: 'thin-column',
  },
};

export default ButtonColumns;
