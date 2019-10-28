import { storeInstance } from '@/store';

export const isCurrentProject = (projectId: number) =>
  storeInstance.auth.activeProjectData.id === projectId;
