import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { IAssinatura, IPagamento } from "../types/subscription";
import {
  getCurrentSubscription,
  getPaymentHistory,
} from "../services/subscriptionService";
import { toast } from "react-toastify";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  CreditCardIcon,
} from "@heroicons/react/24/solid";

const SubscriptionPage = () => {
  const [assinatura, setAssinatura] = useState<IAssinatura | null>(null);
  const [pagamentos, setPagamentos] = useState<IPagamento[]>([]);
  const [loading, setLoading] = useState(true);

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
          error.response?.data?.detail || "Erro ao buscar dados da assinatura."
        );
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      timeZone: "UTC",
    });
  };

  const formatCurrency = (value: string | number) => {
    const numberValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numberValue);
  };

  const getStatusChip = (status: string) => {
    const statusLower = status.toLowerCase();
    if (
      statusLower === "ativa" ||
      statusLower === "aprovado" ||
      statusLower === "confirmado" ||
      statusLower === "pago"
    ) {
      return (
        <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
          <CheckCircleIcon className="mr-1.5 h-4 w-4" />
          {status}
        </span>
      );
    }
    if (statusLower === "pendente") {
      return (
        <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
          <ClockIcon className="mr-1.5 h-4 w-4" />
          {status}
        </span>
      );
    }
    if (
      statusLower === "recusado" ||
      statusLower === "inativa" ||
      statusLower === "cancelada" ||
      statusLower === "inadimplente"
    ) {
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

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Minha Assinatura</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Card do Plano Atual */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md space-y-3 sm:space-y-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Seu Plano Atual</p>
          <div>
            <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
              {assinatura.plano.nome}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(assinatura.plano.preco_mensal)} / mês
            </p>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Sua próxima fatura será em:{" "}
            <span className="font-semibold">
              {formatDate(assinatura.data_proximo_pagamento)}
            </span>
          </p>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <Link
              to="/plans"
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 border border-indigo-600 dark:border-indigo-400 rounded-md px-4 py-2 transition-colors"
            >
              Alterar Plano
            </Link>
          </div>
        </div>

        {/* Card da Forma de Pagamento */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md space-y-3 sm:space-y-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Forma de Pagamento
          </p>
          <div className="flex items-center gap-3">
            <CreditCardIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-200">
                {assinatura.metodo_pagamento_padrao === "cartao"
                  ? "Cartão de Crédito"
                  : assinatura.metodo_pagamento_padrao === "boleto"
                  ? "Boleto Bancário"
                  : "Pix"}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Método de pagamento padrão
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico de Pagamentos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
            Suas Faturas Anteriores
          </h3>
        </div>
        
        {/* Tabela para Desktop */}
        <div className="hidden sm:block flow-root">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                    >
                      Data
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                    >
                      Valor
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {pagamentos.length > 0 ? (
                    pagamentos.map((pagamento) => (
                      <tr key={pagamento.id_pagamento}>
                        <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(pagamento.data_pagamento)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(pagamento.valor)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {getStatusChip(pagamento.status)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
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

        {/* Cards para Mobile */}
        <div className="sm:hidden p-4 space-y-3">
          {pagamentos.length > 0 ? (
            pagamentos.map((pagamento) => (
              <div key={pagamento.id_pagamento} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(pagamento.data_pagamento)}
                  </span>
                  {getStatusChip(pagamento.status)}
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(pagamento.valor)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
              Nenhum pagamento encontrado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
