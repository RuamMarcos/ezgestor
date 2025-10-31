import api from '../api';
import type { PaginatedLogsResponse } from '../types/logs';

/**
 * Busca os logs do sistema com paginação.
 */
export const getLogs = async (
  page: number = 1
): Promise<PaginatedLogsResponse> => {
  const { data } = await api.get<PaginatedLogsResponse>(
    `/api/logs/?page=${page}`
  );
  return data;
};