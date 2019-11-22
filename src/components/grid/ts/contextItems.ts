import {
  MenuItemDef,
  GetContextMenuItemsParams,
} from '@ag-grid-enterprise/all-modules';
import { MergeContext } from '@/types/grid';

export type ContextMenuParams = MergeContext<GetContextMenuItemsParams>;

export type ContextMenuFunc = (
  this: ContextMenuParams,
  ...args: any[]
) => MenuItemDef;

export type ContextMenuCall = (params: ContextMenuParams) => MenuItemDef;

export function createContextItem<T extends ContextMenuFunc>(func: T) {
  return (
    disabled?: (this: ContextMenuParams) => boolean,
    ...args: Parameters<T>
  ) => {
    const createItem: ContextMenuCall = (params) => ({
      disabled: typeof disabled === 'function' ? disabled.apply(params) : false,
      ...func.apply(params, args),
    });
    return createItem;
  };
}

/**
 * Context menu that selects all children
 */
export const selectAllChildren = createContextItem(function() {
  return {
    name: 'Select All Children',
    action: () =>
      this.node.allLeafChildren.forEach((rowNode) => rowNode.setSelected(true)),
  };
});
