import { TreeStructure } from '@/types/api';

interface TreeFlatList {
  id: number;
  parent: number;
}

export const listToTree = <T extends TreeFlatList>(data: T): T => {
  const tree = [];
  const childrenOf = {};
  let item: Partial<TreeStructure>;
  let id;
  let parentId;
  // @ts-ignore
  for (let i = 0, { length } = data; i < length; i += 1) {
    // @ts-ignore
    item = data[i];
    id = item.id;
    parentId = item.parent || 0;
    // every item may have children
    // @ts-ignore
    childrenOf[id] = childrenOf[id] || [];
    // init its children
    // @ts-ignore
    item.children = childrenOf[id];
    if (parentId !== 0) {
      // init its parent's children object
      // @ts-ignore
      childrenOf[parentId] = childrenOf[parentId] || [];
      // push it into its parent's children object
      // @ts-ignore
      childrenOf[parentId].push(item);
    } else {
      tree.push(item);
    }
  }
  // @ts-ignore
  return tree;
};
