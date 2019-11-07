import { storeInstance } from '@/store';

export const capitalize = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export const inDebug = () => storeInstance.settings.debugStatus;
