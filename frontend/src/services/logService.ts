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

/**
 * Cria um log de ação manualmente (ex.: emissão de NF-e via frontend).
 * O usuário autenticado será atribuído pelo backend.
 */
export const createLog = async (params: {
  action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE' | 'LOGIN';
  model_name?: string;
  object_id?: number;
  description: string;
}) => {
  const { data } = await api.post('/logs/create/', params);
  return data;
};