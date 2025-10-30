
import api from '../api';
import type { PaginatedLogResponse } from '../types/logs';

/**
 * Busca a lista paginada de logs de auditoria.
 * @param page O número da página a ser buscada.
 */
export const getLogs = async (page = 1): Promise<PaginatedLogResponse> => {
  try {
    const response = await api.get<PaginatedLogResponse>(`/api/logs/`, {
      params: {
        page: page,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error);
    throw error;
  }
};