import api from '../utils/api';

export interface Product {
  id_produto?: number;
  codigo_do_produto?: string;
  nome: string;
  preco_venda: number | string;
  preco_custo?: number | string;
  quantidade_estoque: number;
  quantidade_minima_estoque: number;
  em_baixo_estoque?: boolean;
}

export interface ProductQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  codigo?: string;
  nome?: string;
  em_baixo_estoque?: boolean | string;
  preco_min?: number | string;
  preco_max?: number | string;
  ordering?: 'nome' | '-nome' | 'preco_venda' | '-preco_venda' | 'quantidade_estoque' | '-quantidade_estoque';
}

export const getProducts = async (params: ProductQueryParams = {}): Promise<any> => {
  const response = await api.get('/estoque/produtos/', { params });
  return response.data;
};

export const createProduct = async (productData: Product): Promise<Product> => {
  const response = await api.post('/estoque/produtos/', productData);
  return response.data;
};

export const deleteProduct = async (productId: number): Promise<void> => {
  await api.delete(`/estoque/produtos/${productId}/`);
};