import { MenuItemDef, GetContextMenuItemsParams } from 'ag-grid-community';
import GridInstance from './GridInstance';
import Store from '@/store/store';
import { MergeContext } from '@/types/grid';

export interface ActionParams {
  gridInstance: GridInstance;
  vueStore: Store;
  params: GetContextMenuItemsParams;
}

export type ContextMenuParams = MergeContext<GetContextMenuItemsParams>;

export interface ExtendedMenuItem extends Omit<MenuItemDef, 'action'> {
  action: (params: ContextMenuParams) => void;
}

export const selectAllChildren: ExtendedMenuItem = {
  name: 'Select All Children',
  action: (params: ContextMenuParams) =>
    params.node.allLeafChildren.forEach((rowNode) => rowNode.setSelected(true)),
};
