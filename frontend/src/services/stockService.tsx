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
  imagem?: File | null | string;
  imagem_url?: string | null;
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
  const form = new FormData();
  Object.entries(productData).forEach(([k, v]) => {
    if (v === undefined || v === null || k === 'imagem_url') return;
    // Evita enviar string vazia para campos decimais opcionais
    if (k === 'preco_custo' && (v === '' || v === ('' as any))) return;
    if (k === 'imagem') {
      // Somente envia se for File; ignora string (URL) ou string vazia
      if (typeof v !== 'string' && v instanceof File) {
        form.append('imagem', v);
      }
      return;
    }
    form.append(k, String(v));
  });
  const response = await api.post('/estoque/produtos/', form);
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
  const form = new FormData();
  Object.entries(productData).forEach(([k, v]) => {
    if (v === undefined || v === null || k === 'imagem_url') return;
    // Evita enviar string vazia para campos decimais opcionais
    if (k === 'preco_custo' && (v === '' || v === ('' as any))) return;
    if (k === 'imagem') {
      if (typeof v !== 'string' && v instanceof File) {
        form.append('imagem', v);
      }
      return;
    }
    form.append(k, String(v));
  });
  const response = await api.put(`/estoque/produtos/${productId}/`, form);
  return response.data;
};