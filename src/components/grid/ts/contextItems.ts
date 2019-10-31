import { MenuItemDef, GetContextMenuItemsParams } from 'ag-grid-community';
import { MergeContext } from '@/types/grid';

export type ContextMenuParams = MergeContext<GetContextMenuItemsParams>;

export type ContextMenuFunc = (params: ContextMenuParams) => MenuItemDef;

export const createContextItem = (func: ContextMenuFunc) => {
  return (
    disabled: (params: ContextMenuParams) => boolean = () => false,
  ): ContextMenuFunc => (params: ContextMenuParams): MenuItemDef => ({
    disabled: disabled(params),
    ...func(params),
  });
};

/**
 * Context menu that selects all children
 */
export const selectAllChildren = createContextItem((params) => ({
  name: 'Select All Children',
  action: () =>
    params.node.allLeafChildren.forEach((rowNode) => rowNode.setSelected(true)),
}));
