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

export interface FinancialStats {
  total_entradas: number;
  total_saidas: number;
  saldo_atual: number;
}

export const getLancamentos = async (): Promise<LancamentoFinanceiro[]> => {
  const response = await api.get('/financeiro/lancamentos/');
  return response.data;
};

export const getFinancialStats = async (): Promise<FinancialStats> => {
    const response = await api.get('/financeiro/stats/');
    return response.data;
};