import { GridButtonRendererParams } from '@/types/grid';
import { ColDef } from 'ag-grid-community';

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
  cellRendererParams: GridButtonRendererParams;
}

export const unlinkButton: GridButton = {
  ...buttonDefault,
  cellRendererParams: {
    icon: 'link_off',
    clickFunction: () => {},
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

export const createGridButton = (
  cellRendererParams: GridButtonRendererParams,
): GridButton => ({
  ...buttonDefault,
  cellRendererParams,
});
