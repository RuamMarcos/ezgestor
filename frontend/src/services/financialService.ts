import api from '../api';

export interface LancamentoFinanceiro {
  id_lancamento: number;
  venda: number | null;
  descricao: string;
  valor: string;
  tipo: 'entrada' | 'saida';
  data_lancamento: string;
  categoria: string;
}

export interface LancamentoFinanceiroData {
  descricao: string;
  valor: number;
  tipo: 'entrada' | 'saida';
  categoria?: string;
}

export interface PaginatedLancamentos {
  count: number;
  next: string | null;
  previous: string | null;
  results: LancamentoFinanceiro[];
}

export interface FinancialStats {
  total_entradas: number;
  total_saidas: number;
  saldo_atual: number;
}

export interface CashflowPoint {
  period: string;
  inflows: number;
  outflows: number;
  net: number;
}

interface LancamentosParams {
  search?: string;
  categoria?: string;
  tipo?: string;
}

export const getLancamentos = async (params: LancamentosParams): Promise<PaginatedLancamentos> => {
  const response = await api.get('/financeiro/lancamentos/', { params });
  return response.data;
};

export const getFinancialStats = async (): Promise<FinancialStats> => {
    const response = await api.get('/financeiro/stats/');
    return response.data;
};

export const getLancamentoCategorias = async (): Promise<string[]> => {
    const response = await api.get('/financeiro/categorias/');
    return response.data;
};

export const getCashflowSeries = async (timeframe: '7days' | '30days' | 'currentMonth' | '12months' = '12months'): Promise<CashflowPoint[]> => {
  const response = await api.get('/financeiro/cashflow/', { params: { timeframe } });
  return response.data.data as CashflowPoint[];
};

export const createLancamento = async (data: LancamentoFinanceiroData): Promise<LancamentoFinanceiro> => {
  const response = await api.post('/financeiro/lancamentos/', data);
  return response.data;
};

export const updateLancamento = async (id: number, data: LancamentoFinanceiroData): Promise<LancamentoFinanceiro> => {
  const response = await api.patch(`/financeiro/lancamentos/${id}/`, data);
  return response.data;
};

export const deleteLancamento = async (id: number): Promise<void> => {
  await api.delete(`/financeiro/lancamentos/${id}/`);
};