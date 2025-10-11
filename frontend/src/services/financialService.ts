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

interface LancamentosParams {
  search?: string;
  categoria?: string;
  tipo?: string;
}

export const getLancamentos = async (params: LancamentosParams): Promise<LancamentoFinanceiro[]> => {
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