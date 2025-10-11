import type { LancamentoFinanceiro } from '../../services/financialService';

interface TransactionsTableProps {
  lancamentos: LancamentoFinanceiro[];
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

function TransactionsTable({ lancamentos }: TransactionsTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {lancamentos.map((lancamento) => (
            <tr key={lancamento.id_lancamento}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lancamento.descricao}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(lancamento.data_lancamento)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`font-semibold ${lancamento.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                  {lancamento.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                </span>
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${lancamento.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                {lancamento.tipo === 'saida' && '- '}
                {formatCurrency(lancamento.valor)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionsTable;