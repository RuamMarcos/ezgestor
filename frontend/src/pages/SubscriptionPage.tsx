import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { IAssinatura, IPagamento } from '../types/subscription';
import {
  getCurrentSubscription,
  getPaymentHistory,
} from '../services/subscriptionService';
import { toast } from 'react-toastify';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/solid';

const SubscriptionPage = () => {
  const [assinatura, setAssinatura] = useState<IAssinatura | null>(null);
  const [pagamentos, setPagamentos] = useState<IPagamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subData, payData] = await Promise.all([
          getCurrentSubscription(),
          getPaymentHistory(),
        ]);
        setAssinatura(subData);
        setPagamentos(payData);
      } catch (error: any) {
        toast.error(
          error.response?.data?.detail ||
            'Erro ao buscar dados da assinatura.'
        );
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      timeZone: 'UTC', 
    });
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value));
  };

  const getStatusChip = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'ativa' || statusLower === 'aprovado' || statusLower === 'confirmado') {
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          <CheckCircleIcon className="mr-1 h-4 w-4" />
          {status}
        </span>
      );
    }
    if (statusLower === 'pendente') {
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
          <ClockIcon className="mr-1 h-4 w-4" />
          {status}
        </span>
      );
    }
    if (statusLower === 'recusado' || statusLower === 'inativa' || statusLower === 'cancelada' || statusLower === 'inadimplente') {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
          <ExclamationCircleIcon className="mr-1 h-4 w-4" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Carregando dados da assinatura...</p>
      </div>
    );
  }

  if (!assinatura) {
    return (
      <div className="rounded-lg bg-white p-6 text-center shadow">
        <h3 className="text-lg font-medium text-gray-900">
          Nenhuma Assinatura Ativa
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Você ainda não possui um plano ativo.
        </p>
        <Link
          to="/plans"
          className="mt-4 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Ver Planos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card do Plano Atual */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold leading-6 text-gray-900">
            Minha Assinatura
          </h3>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Plano Atual</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {assinatura.plano.nome}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <div className="mt-1">{getStatusChip(assinatura.status)}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Próxima Renovação
              </p>
              <p className="mt-1 text-lg text-gray-900">
                {formatDate(assinatura.data_proximo_pagamento)}
              </p>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-200 pt-6">
            <Link
              to="/plans" 
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Trocar de Plano
            </Link>
          </div>
        </div>
      </div>

      {/* Histórico de Pagamentos */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold leading-6 text-gray-900">
            Histórico de Pagamentos
          </h3>
          <div className="mt-4 flow-root">
            <div className="-mx-6 -my-2 overflow-x-auto">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      {/* 👇 TABELA CORRIGIDA (3 COLUNAS) 👇 */}
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900"
                        >
                          Data
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Valor
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {pagamentos.length > 0 ? (
                        pagamentos.map((pagamento) => (
                          <tr key={pagamento.id_pagamento}>
                            <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm text-gray-500">
                              {formatDate(pagamento.data_pagamento)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {formatCurrency(pagamento.valor)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {getStatusChip(pagamento.status)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          {/* 👇 COLSPAN CORRIGIDO 👇 */}
                          <td
                            colSpan={3} 
                            className="py-4 pl-6 text-center text-sm text-gray-500"
                          >
                            Nenhum pagamento encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;