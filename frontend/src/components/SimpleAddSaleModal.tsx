import React, { useState } from 'react';

interface SimpleAddSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleAdded: () => void;
}

export default function SimpleAddSaleModal({ isOpen, onClose, onSaleAdded }: SimpleAddSaleModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simula uma venda bem-sucedida por enquanto
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Venda registrada com sucesso!');
      onSaleAdded();
      onClose();
    } catch (error) {
      alert('Erro ao registrar venda');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Nova Venda (Debug)</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Este é um modal simplificado para testar se o problema está no modal básico ou nas funcionalidades avançadas.
          </p>
          
          <p className="text-gray-600">
            Se este modal funcionar, o problema está na lógica de produtos ou API.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Aguarde...' : 'Testar Venda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}