import React from 'react';

interface Venda {
  id_venda: number;
  nome_produto: string;
  nome_vendedor: string;
  preco_total: string;
  data_venda: string;
  pago?: boolean;
}

interface SalesListItemProps {
  venda: Venda;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatCurrency = (value: string) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(parseFloat(value));
};

const SalesListItem = ({ venda }: SalesListItemProps) => {
  return (
    <li
      key={venda.id_venda}
      className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
    >
      <div>
        <p className="font-semibold text-gray-900">{venda.nome_produto}</p>
        <p className="text-sm text-gray-500">
          Vendido por {venda.nome_vendedor} em {formatDate(venda.data_venda)}
        </p>
        {venda.pago !== false && (
          <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ● Pago
          </span>
        )}
      </div>
      <p className="text-lg font-bold text-blue-600">
        {formatCurrency(venda.preco_total)}
      </p>
    </li>
  );
};

export default SalesListItem;
