import { TreeData } from '@/types/api';
import { GridDataTransformer } from '@/types/grid';

export default class TreeTransformer implements GridDataTransformer {
  public transform<T extends TreeData[]>(data: T): TreeData[] {
    return data.map(
      (row): TreeData => {
        const { children, ...noChildren } = row;
        return {
          group: !!children.length,
          ...noChildren,
        };
      },
    );
  }
}
