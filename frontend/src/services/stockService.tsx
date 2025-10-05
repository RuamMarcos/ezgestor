import api from '../api';

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

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/estoque/produtos/');
  return response.data;
};

export const createProduct = async (productData: Product): Promise<Product> => {
  const response = await api.post('/estoque/produtos/', productData);
  return response.data;
};

export const deleteProduct = async (productId: number): Promise<void> => {
  await api.delete(`/estoque/produtos/${productId}/`);
};

export const quickAddProduct = async (quickAddString: string): Promise<Product> => {
  const response = await api.post('/estoque/produtos/quick-add/', {
    quick_add_string: quickAddString
  });
  return response.data;
};

export const addStockToProduct = async (productId: number, quantity: number): Promise<Product> => {
  const response = await api.post(`/estoque/produtos/${productId}/add-stock/`, {
    quantity: quantity
  });
  return response.data;
};

export const updateProduct = async (productId: number, productData: Product): Promise<Product> => {
  const response = await api.put(`/estoque/produtos/${productId}/`, productData);
  return response.data;
};