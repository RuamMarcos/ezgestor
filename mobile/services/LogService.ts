import api from '../utils/api';
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

type CreateLogPayload = {
  action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE' | 'LOGIN';
  model_name?: string | null;
  object_id?: number | null;
  description: string;
};

export async function createLog(payload: CreateLogPayload): Promise<void> {
  await api.post('/logs/create/', payload);
}