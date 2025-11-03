import { useState } from 'react';
import { toast } from 'react-toastify';
import { updatePaymentMethod } from '../../services/subscriptionService';
import {
  aplicarMascaraCartao,
  aplicarMascaraValidade,
  aplicarMascaraCvv,
} from '../../utils/masks';

interface UpdatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UpdatePaymentModal: React.FC<UpdatePaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [dadosCartao, setDadosCartao] = useState({
    numero: '',
    validade: '',
    cvv: '',
    nome: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let valorFormatado = value;
    if (name === 'numero') valorFormatado = aplicarMascaraCartao(value);
    else if (name === 'validade') valorFormatado = aplicarMascaraValidade(value);
    else if (name === 'cvv') valorFormatado = aplicarMascaraCvv(value);
    setDadosCartao((prev) => ({ ...prev, [name]: valorFormatado }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!dadosCartao.numero || !dadosCartao.validade || !dadosCartao.cvv || !dadosCartao.nome) {
      setError('Todos os campos do cartão são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      await updatePaymentMethod({
        metodo: 'cartao',
      });
      toast.success('Forma de pagamento atualizada com sucesso!');
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Falha ao atualizar o método de pagamento.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-2xl font-bold">Atualizar Forma de Pagamento</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div>
            <label className="text-sm font-medium text-gray-600">Número do Cartão</label>
            <input
              type="text"
              name="numero"
              placeholder="0000 0000 0000 0000"
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg"
              value={dadosCartao.numero}
              onChange={handleChange}
            />
          </div>
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="text-sm font-medium text-gray-600">Validade</label>
              <input
                type="text"
                name="validade"
                placeholder="MM/AA"
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg"
                value={dadosCartao.validade}
                onChange={handleChange}
              />
            </div>
            <div className="w-1/2">
              <label className="text-sm font-medium text-gray-600">CVV</label>
              <input
                type="text"
                name="cvv"
                placeholder="123"
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg"
                value={dadosCartao.cvv}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Nome no Cartão</label>
            <input
              type="text"
              name="nome"
              placeholder="Como está no cartão"
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg"
              value={dadosCartao.nome}
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePaymentModal;