import { MergeContext } from '@/types/grid';
import { ColDef, ICellRendererParams } from 'ag-grid-community';

const buttonDefault: Omit<GridButton, 'cellRendererParams'> = {
  resizable: false,
  lockPosition: true,
  pinned: 'left',
  suppressMenu: true,
  sortable: false,
  maxWidth: 40,
  width: 40,
  minWidth: 40,
  cellClass: 'thin-column',
  cellRendererFramework: 'GridButton',
};

export interface GridButton extends ColDef {
  resizable: false;
  lockPosition: true;
  pinned: 'left';
  suppressMenu: true;
  sortable: false;
  maxWidth: 40;
  width: 40;
  minWidth: 40;
  cellClass: 'thin-column';
  cellRendererFramework: 'GridButton';
  cellRendererParams: {
    icon: string;
    clickFunction?: (params: MergeContext<ICellRendererParams>) => void;
  };
}

export const dragButton: GridButton = {
  ...buttonDefault,
  cellRendererParams: {
    icon: 'drag_handle',
  },
};

export const unlinkButton: GridButton = {
  ...buttonDefault,
  cellRendererParams: {
    icon: 'link_off',
    // TODO Implement Unlink button
  },
};

export const editButton: GridButton = {
  ...buttonDefault,
  cellRendererParams: {
    icon: 'create',
    clickFunction: ({ node, context }) =>
      context.gridInstance.componentApi.editRow(node),
  },
};

export const addChildButton: GridButton = {
  ...buttonDefault,
  cellRendererParams: {
    icon: 'keyboard_tab',
    clickFunction: ({ node, context }) =>
      context.gridInstance.componentApi.addChildToRow(node),
  },
};
