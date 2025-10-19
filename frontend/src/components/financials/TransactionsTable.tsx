import type { LancamentoFinanceiro } from '../../services/financialService';

interface TransactionsTableProps {
  lancamentos: LancamentoFinanceiro[];
  onEdit: (lancamento: LancamentoFinanceiro) => void;
  onDelete: (id: number) => void;
}

const formatCurrency = (value: string): string => {
  const numberValue = parseFloat(value);
  if (isNaN(numberValue)) return 'N/A';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

function TransactionsTable({ lancamentos, onEdit, onDelete }: TransactionsTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
            {/* ADICIONE A COLUNA AÇÕES */}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {lancamentos.map((lancamento) => (
            <tr key={lancamento.id_lancamento}>
              {/* ... (tds existentes) ... */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lancamento.descricao}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                  {lancamento.categoria || 'Sem categoria'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(lancamento.data_lancamento)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`font-semibold ${lancamento.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                  {lancamento.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                </span>
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${lancamento.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                {/* Se for associado a uma venda, não pode ser editado/excluído manualmente */}
                {lancamento.tipo === 'saida' && '- '}
                {formatCurrency(lancamento.valor)}
              </td>
              
              {/* ADICIONE OS BOTÕES DE AÇÃO */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                {/* Lançamentos de VENDAS não podem ser editados/excluídos manualmente */}
                {lancamento.venda === null ? (
                  <>
                    <button 
                      onClick={() => onEdit(lancamento)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(lancamento.id_lancamento)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Excluir
                    </button>
                  </>
                ) : (
                  <span className="text-gray-400 text-xs italic">Venda</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionsTable;