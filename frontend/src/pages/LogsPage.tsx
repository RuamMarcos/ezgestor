import React, { useState, useEffect } from 'react';
import { getLogs } from '../services/logService';
import type { Log } from '../types/logs';
import { toast } from 'react-toastify';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  const fetchLogs = async (page: number) => {
    setIsLoading(true);
    try {
      const data = await getLogs(page);

      const mappedLogs: Log[] = (data.results || []).map((r: any) => ({
        id: r.id,
        user: r.user?.email ?? 'Usuário do Sistema',
        action_type: r.action_type_display,
        details: r.description, 
        timestamp: r.action_time, 
      }));

      setLogs(mappedLogs);
      setCount(data.count);
      setTotalPages(Math.ceil(data.count / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      toast.error('Não foi possível carregar os logs do sistema.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  };

  return (
    <div className="container mx-auto p-6 xl:p-8">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Logs do Sistema</h1>
      <p className="mb-6 text-gray-600">
        Acompanhe as atividades recentes dos funcionários no sistema.
      </p>

      {isLoading && (
        <div className="text-center p-10">
          <p>Carregando logs...</p>
        </div>
      )}

      {!isLoading && logs.length === 0 && (
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <p>Nenhum log encontrado.</p>
        </div>
      )}

      {!isLoading && logs.length > 0 && (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Data/Hora
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Usuário
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ação
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Detalhes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {log.action_type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{' '}
                <span className="font-medium">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{' '}
                a{' '}
                <span className="font-medium">
                  {Math.min(currentPage * ITEMS_PER_PAGE, count)}
                </span>{' '}
                de <span className="font-medium">{count}</span> resultados
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <ChevronLeftIcon className="h-5 w-5 mr-1" />
                Anterior
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                Próximo
                <ChevronRightIcon className="h-5 w-5 ml-1" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LogsPage;