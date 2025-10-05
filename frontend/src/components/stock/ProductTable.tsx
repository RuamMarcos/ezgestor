import type { Product } from '../../services/stockService';

interface ProductTableProps {
  produtos: Product[];
  onDeleteProduct: (productId: number) => void;
  onAddStock: (product: Product) => void; 
}

const formatCurrency = (value: number | string | undefined): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (typeof numValue !== 'number' || isNaN(numValue)) return 'N/A';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
};

function ProductTable({ produtos, onDeleteProduct, onAddStock }: ProductTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código/SKU</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {produtos.map((produto) => (
            <tr key={produto.id_produto}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{produto.nome}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produto.codigo_do_produto || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(produto.preco_venda)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produto.quantidade_estoque}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {produto.em_baixo_estoque ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Baixo
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Bom
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                <button 
                  onClick={() => onAddStock(produto)}
                  className="text-green-600 hover:text-green-900"
                >
                  Adicionar
                </button>
                <button className="text-indigo-600 hover:text-indigo-900">Editar</button>
                <button 
                  onClick={() => onDeleteProduct(produto.id_produto!)} 
                  className="text-red-600 hover:text-red-900"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductTable;