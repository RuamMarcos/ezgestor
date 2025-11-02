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
  CreditCardIcon,
  DocumentArrowDownIcon,
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
        if (error.response?.status !== 404) {
          toast.error(
            error.response?.data?.detail ||
              'Erro ao buscar dados da assinatura.'
          );
          console.error(error);
        }
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

  const formatCurrency = (value: string | number) => {
    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numberValue);
  };

  const getStatusChip = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'ativa' || statusLower === 'aprovado' || statusLower === 'confirmado' || statusLower === 'pago') {
      return (
        <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
          <CheckCircleIcon className="mr-1.5 h-4 w-4" />
          {status}
        </span>
      );
    }
    if (statusLower === 'pendente') {
      return (
        <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
          <ClockIcon className="mr-1.5 h-4 w-4" />
          {status}
        </span>
      );
    }
    if (statusLower === 'recusado' || statusLower === 'inativa' || statusLower === 'cancelada' || statusLower === 'inadimplente') {
      return (
        <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
          <ExclamationCircleIcon className="mr-1.5 h-4 w-4" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
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
      <div className="rounded-lg bg-white p-8 text-center shadow-md">
        <h3 className="text-xl font-medium text-gray-900">
          Nenhuma Assinatura Ativa
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Você ainda não possui um plano ativo para sua empresa.
        </p>
        <Link
          to="/plans"
          className="mt-6 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Ver Planos
        </Link>
      </div>
    );
  }

  const lastPaymentMethod = pagamentos.length > 0 ? pagamentos[0].metodo : null;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Minha Assinatura</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card do Plano Atual */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md space-y-4">
          <p className="text-sm font-medium text-gray-500">Seu Plano Atual</p>
          <div>
            <p className="text-xl font-bold text-gray-800">{assinatura.plano.nome}</p>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(assinatura.plano.preco_mensal)} / mês</p>
          </div>
          <p className="text-sm text-gray-600">
            Sua próxima fatura será em: <span className="font-semibold">{formatDate(assinatura.data_proximo_pagamento)}</span>
          </p>
          <div className="border-t border-gray-200 pt-4">
            <Link
              to="/plans"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 border border-indigo-600 rounded-md px-4 py-2 transition-colors"
            >
              Alterar Plano
            </Link>
          </div>
        </div>

        {/* Card da Forma de Pagamento */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <p className="text-sm font-medium text-gray-500">Forma de Pagamento</p>
          {lastPaymentMethod === 'cartao' ? (
            <div className="flex items-center gap-3">
              <CreditCardIcon className="h-6 w-6 text-gray-400" />
              <p className="font-semibold text-gray-700">Cartão de Crédito</p>
            </div>
          ) : (
            <p className="text-gray-600">Nenhum cartão de crédito cadastrado.</p>
          )}
          <div className="border-t border-gray-200 pt-4">
            <button
              type="button"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 border border-indigo-600 rounded-md px-4 py-2 transition-colors"
            >
              Atualizar Dados
            </button>
          </div>
        </div>
      </div>

      {/* Histórico de Pagamentos */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h3 className="text-xl font-semibold leading-6 text-gray-900">
            Suas Faturas Anteriores
          </h3>
        </div>
        <div className="flow-root">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900">Data</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Valor</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Recibo</th>
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
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <button disabled className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 disabled:text-gray-400 disabled:cursor-not-allowed">
                            <DocumentArrowDownIcon className="h-4 w-4" />
                            Baixar PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-gray-500">
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
  );
};

export default SubscriptionPage;