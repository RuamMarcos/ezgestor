import api from '../api';
import type { PaginatedLogsResponse } from '../types/logs';

/**
 * Busca os logs do sistema com paginação e filtros.
 */
export const getLogs = async (
  page: number = 1,
  userId: string = '',
  actionType: string = ''
): Promise<PaginatedLogsResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());

  if (userId) {
    params.append('user_id', userId);
  }
  if (actionType) {
    params.append('action_type', actionType);
  }

  const { data } = await api.get<PaginatedLogsResponse>(
    `/logs/?${params.toString()}`
  );
  return data;
};