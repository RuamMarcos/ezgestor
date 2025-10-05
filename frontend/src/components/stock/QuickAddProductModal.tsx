import { useState } from 'react';
import type { Product } from '../../services/stockService';

interface ModalProps {
  product: Product;
  onClose: () => void;
  onSave: (productId: number, quantity: number) => void;
}

function QuickAddProductModal({ product, onClose, onSave }: ModalProps) {
  const [quantity, setQuantity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quantityNum = parseInt(quantity, 10);
    if (!isNaN(quantityNum) && quantityNum > 0) {
      onSave(product.id_produto!, quantityNum);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Adicionar Estoque</h2>
        <p className="text-center text-gray-600 mb-6">
          Adicionando estoque para: <span className="font-bold">{product.nome}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            name="quantity"
            placeholder="Quantidade"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg text-center"
          />
          <div className="flex justify-center gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuickAddProductModal;