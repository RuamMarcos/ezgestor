import api from '../utils/api';
import { Platform } from 'react-native';

export interface Product {
  id_produto?: number;
  codigo_do_produto?: string;
  nome: string;
  preco_venda: number | string;
  preco_custo?: number | string;
  quantidade_estoque: number;
  quantidade_minima_estoque: number;
  em_baixo_estoque?: boolean;
  imagem_url?: string | null;
  // For create/update from mobile: local picked image
  imagem?: { uri: string; name?: string; type?: string } | null;
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
    // Always use multipart/form-data to support optional image upload
    const formData = new FormData();
    // Required/optional text & numeric fields
    formData.append('nome', String(productData.nome ?? ''));
    if (productData.codigo_do_produto) formData.append('codigo_do_produto', String(productData.codigo_do_produto));
    if (productData.preco_venda !== undefined && productData.preco_venda !== null) formData.append('preco_venda', String(productData.preco_venda));
    if (productData.preco_custo !== undefined && productData.preco_custo !== null) formData.append('preco_custo', String(productData.preco_custo));
    if (productData.quantidade_estoque !== undefined && productData.quantidade_estoque !== null) formData.append('quantidade_estoque', String(productData.quantidade_estoque));
    if (productData.quantidade_minima_estoque !== undefined && productData.quantidade_minima_estoque !== null) formData.append('quantidade_minima_estoque', String(productData.quantidade_minima_estoque));

    // Optional image
    if (productData.imagem && productData.imagem.uri) {
      const fileName = productData.imagem.name || `produto_${Date.now()}.jpg`;
      const mimeType = productData.imagem.type || 'image/jpeg';
      if (Platform.OS === 'web') {
        // On web, convert the URI to a Blob and append it
        const resp = await fetch(productData.imagem.uri);
        const blob = await resp.blob();
        formData.append('imagem', blob, fileName);
      } else {
        // On native, append RN-style file descriptor
        formData.append('imagem', { uri: productData.imagem.uri, name: fileName, type: mimeType } as any);
      }
    }

    const response = await api.post('/estoque/produtos/', formData);
    return response.data;
};

export const deleteProduct = async (productId: number): Promise<void> => {
    await api.delete(`/estoque/produtos/${productId}/`);
};

export const updateProduct = async (productId: number, productData: Product): Promise<Product> => {
  // Use multipart/form-data for updates to allow optional image change
  const formData = new FormData();
  formData.append('nome', String(productData.nome ?? ''));
  if (productData.codigo_do_produto !== undefined) formData.append('codigo_do_produto', String(productData.codigo_do_produto ?? ''));
  if (productData.preco_venda !== undefined) formData.append('preco_venda', String(productData.preco_venda ?? ''));
  if (productData.preco_custo !== undefined) formData.append('preco_custo', String(productData.preco_custo ?? ''));
  if (productData.quantidade_estoque !== undefined) formData.append('quantidade_estoque', String(productData.quantidade_estoque ?? ''));
  if (productData.quantidade_minima_estoque !== undefined) formData.append('quantidade_minima_estoque', String(productData.quantidade_minima_estoque ?? ''));

  if (productData.imagem && productData.imagem.uri) {
    const fileName = productData.imagem.name || `produto_${Date.now()}.jpg`;
    const mimeType = productData.imagem.type || 'image/jpeg';
    if (Platform.OS === 'web') {
      const resp = await fetch(productData.imagem.uri);
      const blob = await resp.blob();
      formData.append('imagem', blob, fileName);
    } else {
      formData.append('imagem', { uri: productData.imagem.uri, name: fileName, type: mimeType } as any);
    }
  }

  const response = await api.put(`/estoque/produtos/${productId}/`, formData);
  return response.data;
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