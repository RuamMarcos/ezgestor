import api from '../utils/api';

export interface VendaUpdatePayload {
  quantidade?: number;
  cliente_nome?: string | null;
  cliente_email?: string | null;
  cliente_telefone?: string | null;
}

export const updateSale = async (id: number, data: VendaUpdatePayload) => {
  const response = await api.patch(`/vendas/${id}/`, data);
  return response.data;
};

export const deleteSale = async (id: number) => {
  await api.delete(`/vendas/${id}/`);
};
