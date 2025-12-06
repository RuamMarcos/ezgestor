import React, { useState, useEffect } from 'react';
import { getLogs } from '../services/logService';
import { getTeamMembers } from '../services/teamService';
import type { TeamMember } from '../services/teamService';
import type { Log, RawLog } from '../types/logs';
import { toast } from 'react-toastify';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/solid';

const ACTION_TYPES = [
  { key: 'CREATE', label: 'Criação' },
  { key: 'UPDATE', label: 'Atualização' },
  { key: 'DELETE', label: 'Deleção' },
  { key: 'SOFT_DELETE', label: 'Desativação' },
  { key: 'LOGIN', label: 'Login' },
];

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [appliedUser, setAppliedUser] = useState('');
  const [appliedAction, setAppliedAction] = useState('');
  const ITEMS_PER_PAGE = 15;
  useEffect(() => {
    fetchLogs(currentPage, appliedUser, appliedAction);
  }, [currentPage, appliedUser, appliedAction]);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsFetchingUsers(true);
      try {
        const members = await getTeamMembers();
        setTeamMembers(members);
      } catch (error) {
        console.error('Erro ao buscar membros da equipe:', error);
        toast.error('Não foi possível carregar a lista de usuários.');
      } finally {
        setIsFetchingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const fetchLogs = async (page: number, userId: string, actionType: string) => {
    setIsLoading(true);
    try {
      const data = await getLogs(page, userId, actionType);

      const mappedLogs: Log[] = (data.results || []).map((r: RawLog) => ({
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setAppliedUser(selectedUser);
    setAppliedAction(selectedAction);
  };

  const handleClearSearch = () => {
    setSelectedUser('');
    setSelectedAction('');
    setAppliedUser('');
    setAppliedAction('');
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  };

  return (
    <div className="container mx-auto p-2 sm:p-6 xl:p-8">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4 text-gray-800 dark:text-gray-100">Logs do Sistema</h1>
      <p className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-600 dark:text-gray-400">
        Acompanhe as atividades recentes dos funcionários no sistema.
      </p>

      {/* Formulário de Busca com <select> */}
      <div className="mb-4 sm:mb-6 bg-white dark:bg-gray-800 shadow-sm rounded-lg p-3 sm:p-4">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-end"
        >
          <div>
            <label
              htmlFor="searchUser"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Filtrar por Usuário
            </label>
            <select
              id="searchUser"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              disabled={isFetchingUsers || isLoading}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="">Todos os Usuários</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.email} ({member.first_name})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="searchAction"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Filtrar por Ação
            </label>
            <select
              id="searchAction"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              disabled={isLoading}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="">Todas as Ações</option>
              {ACTION_TYPES.map((action) => (
                <option key={action.key} value={action.key}>
                  {action.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              Pesquisar
            </button>
            <button
              type="button"
              onClick={handleClearSearch}
              disabled={isLoading}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Limpar
            </button>
          </div>
        </form>
      </div>

      {isLoading && (
        <div className="text-center p-6 sm:p-10">
          <p className="text-gray-600 dark:text-gray-400">Carregando logs...</p>
        </div>
      )}

      {!isLoading && logs.length === 0 && (
        <div className="text-center p-6 sm:p-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">
            Nenhum log encontrado
            {appliedUser || appliedAction ? ' para os filtros aplicados' : ''}.
          </p>
        </div>
      )}

      {!isLoading && logs.length > 0 && (
        <>
          {/* Tabela para Desktop */}
          <div className="hidden md:block bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Data/Hora
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Usuário
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Ação
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Detalhes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {log.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {log.action_type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards para Mobile */}
          <div className="md:hidden space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-400">
                    {log.action_type}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {log.user}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {log.details}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 sm:mt-6">
            <div>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
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
            <div className="flex justify-center sm:justify-end gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || isLoading}
                className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <ChevronLeftIcon className="h-5 w-5 sm:mr-1" />
                <span className="hidden sm:inline">Anterior</span>
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || isLoading}
                className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <span className="hidden sm:inline">Próximo</span>
                <ChevronRightIcon className="h-5 w-5 sm:ml-1" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LogsPage;