import { useState, useEffect } from 'react';
import type { LancamentoFinanceiro, LancamentoFinanceiroData } from '../../services/financialService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LancamentoFinanceiroData) => void;
  initialData: LancamentoFinanceiro | null; // Null para 'Novo', objeto para 'Editar'
}

function AddEditLancamentoModal({ isOpen, onClose, onSave, initialData }: Props) {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState(0);
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('saida');
  const [categoria, setCategoria] = useState('');
  const [error, setError] = useState('');

  const isEditing = initialData !== null;

  useEffect(() => {
    if (initialData) {
      setDescricao(initialData.descricao);
      setValor(parseFloat(initialData.valor));
      setTipo(initialData.tipo);
      setCategoria(initialData.categoria || '');
    } else {
      // Resetar para 'Novo'
      setDescricao('');
      setValor(0);
      setTipo('saida');
      setCategoria('');
    }
    setError('');
  }, [initialData, isOpen]); // Resetar campos quando o modal abre

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (valor <= 0) {
      setError('O valor deve ser maior que zero.');
      return;
    }
    if (!descricao) {
      setError('A descrição é obrigatória.');
      return;
    }

    onSave({
      descricao,
      valor,
      tipo,
      categoria,
    });
  };

  if (!isOpen) return null;

  return (
    // (Este é um layout de modal básico. Adapte ao seu sistema de design/componentes)
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          {isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={valor}
              onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as 'entrada' | 'saida')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="saida">Saída (Despesa)</option>
              <option value="entrada">Entrada (Receita)</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Categoria (Opcional)</label>
            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {isEditing ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEditLancamentoModal;