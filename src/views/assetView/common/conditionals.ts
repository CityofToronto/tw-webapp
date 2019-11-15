import { storeInstance } from '@/store';

export const isCurrentProject = (projectId: number) =>
  parseInt(storeInstance.project.id) === projectId;
