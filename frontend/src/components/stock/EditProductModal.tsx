import { useState, useEffect } from 'react';
import type { Product } from '../../services/stockService';

interface ModalProps {
  product: Product;
  onClose: () => void;
  onSave: (product: Product) => void;
}

function EditProductModal({ product, onClose, onSave }: ModalProps) {
  const [formData, setFormData] = useState<Product>(product);

  useEffect(() => {
    setFormData(product);
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Normaliza campos numéricos e trata preco_custo vazio como null
    const payload: Product = {
      ...formData,
      preco_venda: formData.preco_venda === '' ? 0 : Number(formData.preco_venda),
      preco_custo: formData.preco_custo === '' ? undefined : Number(formData.preco_custo),
      quantidade_estoque: Number(formData.quantidade_estoque),
      quantidade_minima_estoque: Number(formData.quantidade_minima_estoque),
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Editar Produto</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text" name="nome" placeholder="Nome do Produto"
              value={formData.nome} onChange={handleChange} required
              className="w-2/3 px-4 py-2 border rounded-lg"
            />
            <input
              type="text" name="codigo_do_produto" placeholder="Código/SKU"
              value={formData.codigo_do_produto || ''} onChange={handleChange}
              className="w-1/3 px-4 py-2 border rounded-lg"
            />
          </div>
          <div className="flex gap-4">
            <input
              type="number" name="preco_venda" placeholder="Preço de Venda"
              value={formData.preco_venda} onChange={handleChange} required
              className="w-1/2 px-4 py-2 border rounded-lg" step="0.01"
            />
            <input
              type="number" name="preco_custo" placeholder="Preço de Custo (Opcional)"
              value={formData.preco_custo || ''} onChange={handleChange}
              className="w-1/2 px-4 py-2 border rounded-lg" step="0.01"
            />
          </div>
          <div className="flex gap-4">
            <input
              type="file" name="imagem" accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setFormData(prev => ({ ...prev, imagem: file as any }));
              }}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          {formData.imagem_url && typeof formData.imagem_url === 'string' && (
            <div>
              <img src={formData.imagem_url} alt="Imagem atual" className="w-32 h-32 object-cover rounded" />
            </div>
          )}
          <div className="flex gap-4">
             <input
              type="number" name="quantidade_estoque" placeholder="Qtd. em Estoque"
              value={formData.quantidade_estoque} onChange={handleChange} required
              className="w-1/2 px-4 py-2 border rounded-lg"
            />
            <input
              type="number" name="quantidade_minima_estoque" placeholder="Qtd. Mínima"
              value={formData.quantidade_minima_estoque} onChange={handleChange} required
              className="w-1/2 px-4 py-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProductModal;