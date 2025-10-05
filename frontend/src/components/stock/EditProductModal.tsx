// frontend/src/components/stock/EditProductModal.tsx

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
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Editar Produto</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos do formulário preenchidos com os dados do produto */}
          <div className="flex gap-4">
            <input
              type="text" name="nome" placeholder="Nome do Produto"
              value={formData.nome} onChange={handleChange} required
              className="w-2/3 px-4 py-2 border rounded-lg"
            />
            <input
              type="text" name="codigo_do_produto" placeholder="Código/SKU"
              value={formData.codigo_do_produto} onChange={handleChange}
              className="w-1/3 px-4 py-2 border rounded-lg"
            />
          </div>
          {/* ... outros campos ... */}
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