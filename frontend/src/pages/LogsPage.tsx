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
    <div className="container mx-auto p-6 xl:p-8">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Logs do Sistema</h1>
      <p className="mb-6 text-gray-600">
        Acompanhe as atividades recentes dos funcionários no sistema.
      </p>

      {/* Formulário de Busca com <select> */}
      <div className="mb-6 bg-white shadow-sm rounded-lg p-4">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
        >
          <div className="md:col-span-1">
            <label
              htmlFor="searchUser"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filtrar por Usuário
            </label>
            <select
              id="searchUser"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              disabled={isFetchingUsers || isLoading}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
            >
              <option value="">Todos os Usuários</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.email} ({member.first_name})
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label
              htmlFor="searchAction"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filtrar por Ação
            </label>
            <select
              id="searchAction"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              disabled={isLoading}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
            >
              <option value="">Todas as Ações</option>
              {ACTION_TYPES.map((action) => (
                <option key={action.key} value={action.key}>
                  {action.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1 flex space-x-2">
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
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Limpar
            </button>
          </div>
        </form>
      </div>

      {isLoading && (
        <div className="text-center p-10">
          <p>Carregando logs...</p>
        </div>
      )}

      {!isLoading && logs.length === 0 && (
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <p>
            Nenhum log encontrado
            {appliedUser || appliedAction ? ' para os filtros aplicados' : ''}.
          </p>
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