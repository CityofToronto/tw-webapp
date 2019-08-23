import { TreeStructure } from '@/types/api';

interface TreeFlatList {
  id: number;
  parent: number;
  name: string;
}

export const listToTree = (data: TreeFlatList): TreeStructure[] => {
  const tree = [];
  const childrenOf = {};
  let item;
  let id;
  let parentId;

  for (let i = 0, { length } = data; i < length; i += 1) {
    item = data[i];
    id = item.id;
    parentId = item.parent || 0;
    // every item may have children
    childrenOf[id] = childrenOf[id] || [];
    // init its children
    item.children = childrenOf[id];
    if (parentId !== 0) {
      // init its parent's children object
      childrenOf[parentId] = childrenOf[parentId] || [];
      // push it into its parent's children object
      childrenOf[parentId].push(item);
    } else {
      tree.push(item);
    }
  };

  return tree;
};
