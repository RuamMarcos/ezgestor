import api from '../api';

export interface Sale {
  id_venda?: number;
  produto_id: number;
  nome_produto?: string;
  quantidade: number;
  preco_unitario?: number;
  preco_total?: number;
  data_venda?: string;
}

export interface Product {
  id_produto: number;
  nome: string;
  preco_venda: number;
  quantidade_estoque: number;
  codigo_do_produto?: string;
}

export interface SaleResponse {
  id_venda: number;
  nome_produto: string;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
  data_venda: string;
}

// Buscar produtos disponíveis para venda
export const getAvailableProducts = async (): Promise<Product[]> => {
  const response = await api.get('/vendas/produtos_disponiveis/');
  return response.data;
};

// Criar nova venda
export const createSale = async (sale: Sale): Promise<SaleResponse> => {
  const response = await api.post('/vendas/', sale);
  return response.data;
};

// Listar vendas
export const getSales = async (page: number = 1, search: string = '') => {
  const response = await api.get('/vendas/', {
    params: {
      page,
      search,
    },
  });
  return response.data;
};