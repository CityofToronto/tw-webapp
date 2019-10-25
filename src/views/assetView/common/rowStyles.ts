import { RowStyleParams } from '@/types/grid';

export const reservationRowStyle = (params: RowStyleParams) => {
  if (params.data) {
    if (
      params.context.vueStore.auth.activeProjectData.id !==
        params.data.project_id &&
      !!params.data.project_id
    )
      return { background: '#eceff1' };
    if (params.data.approval_status === 'Pending')
      return { background: '#e0f7fa' };
    if (params.data.approval_status === 'Approved')
      return { background: '#e8f5e9' };
  }
  return { background: 'transparent' };
};
