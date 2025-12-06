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
    <div>
      {/* Tabela para Desktop */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descrição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {lancamentos.map((lancamento) => (
              <tr key={lancamento.id_lancamento} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{lancamento.descricao}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full text-xs">
                    {lancamento.categoria || 'Sem categoria'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(lancamento.data_lancamento)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`font-semibold ${lancamento.tipo === 'entrada' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {lancamento.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${lancamento.tipo === 'entrada' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {lancamento.tipo === 'saida' && '- '}
                  {formatCurrency(lancamento.valor)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                  {lancamento.venda === null ? (
                    <>
                      <button 
                        onClick={() => onEdit(lancamento)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(lancamento.id_lancamento)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Excluir
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-xs italic">Venda</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards para Mobile */}
      <div className="md:hidden space-y-3">
        {lancamentos.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Nenhuma transação encontrada.
          </div>
        ) : (
          lancamentos.map((lancamento) => (
            <div key={lancamento.id_lancamento} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              {/* Header do card com descrição e valor */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 pr-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {lancamento.descricao}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {formatDate(lancamento.data_lancamento)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-base font-semibold ${lancamento.tipo === 'entrada' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {lancamento.tipo === 'saida' && '- '}
                    {formatCurrency(lancamento.valor)}
                  </p>
                  <span className={`text-xs font-medium ${lancamento.tipo === 'entrada' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {lancamento.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                  </span>
                </div>
              </div>
              
              {/* Categoria */}
              <div className="mb-3">
                <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full text-xs text-gray-600 dark:text-gray-300">
                  {lancamento.categoria || 'Sem categoria'}
                </span>
              </div>
              
              {/* Ações */}
              <div className="flex justify-end items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                {lancamento.venda === null ? (
                  <div className="flex gap-4">
                    <button 
                      onClick={() => onEdit(lancamento)}
                      className="text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(lancamento.id_lancamento)}
                      className="text-sm text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Excluir
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 text-xs italic">Gerado por Venda</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TransactionsTable;