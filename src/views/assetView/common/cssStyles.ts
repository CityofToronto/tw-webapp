import { RowStyleParams } from '@/types/grid';
import { ClassRules } from '@/types/agGrid';
import { isCurrentProject } from './conditionals';

export const reservationRowStyle = (params: RowStyleParams) => {
  if (
    params.context.vueStore.project.id !== params?.data?.project_id &&
    !!params?.data?.project_id
  )
    return { background: '#eceff1' };
  if (params?.data?.approval_status === 'Pending')
    return { background: '#e0f7fa' };
  if (params?.data?.approval_status === 'Approved')
    return { background: '#e8f5e9' };
  return { background: 'transparent' };
};

export const roleClassRules: ClassRules = {
  'background-green': ({ data }) => data?.role_missing_from_registry,
  'background-light-blue': ({ data }) => data?.parent_changed,
};

export const assetGetStyle = () => ({ data }) => {
  if (!isCurrentProject(data?.project_id)) return { background: '#eceff1' };
  if (data?.asset_missing_from_registry) return { background: '#e8f5e9' };
  if (data?.role_changed) return { background: '#e0f7fa' };
  return { background: 'transparent' };
};
