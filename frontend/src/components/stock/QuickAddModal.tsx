import { useState } from 'react';

interface ModalProps {
  onClose: () => void;
  onSave: (value: string) => void;
}

function QuickAddModal({ onClose, onSave }: ModalProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Entrada Rápida de Estoque</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            Digite o código do produto e a quantidade a ser adicionada, separados por dois pontos (ex: <span className="font-mono bg-gray-200 px-1 rounded">10:12</span>).
          </p>
          <input
            type="text"
            name="quickAdd"
            placeholder="código:quantidade"
            value={value}
            onChange={(e) => setValue(e.target.value)}
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

export default QuickAddModal;