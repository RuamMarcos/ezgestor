import type { Product } from '../../services/stockService';

interface ProductTableProps {
  produtos: Product[];
  onDeleteProduct: (productId: number) => void;
  onAddStock: (product: Product) => void;
  onEditProduct: (product: Product) => void; // Adicione esta linha
}

const formatCurrency = (value: number | string | undefined): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (typeof numValue !== 'number' || isNaN(numValue)) return 'N/A';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
};

function ProductTable({ produtos, onDeleteProduct, onAddStock, onEditProduct }: ProductTableProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {produtos.map((produto) => (
        <div key={produto.id_produto} className="bg-white rounded-lg shadow p-4 flex flex-col">
          <div className="h-40 w-full bg-gray-100 rounded mb-3 flex items-center justify-center overflow-hidden">
            {produto.imagem_url ? (
              <img src={produto.imagem_url} alt={produto.nome} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2H9l-4 4v-4H5a2 2 0 01-2-2V5z"/>
              </svg>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">{produto.nome}</h3>
              <span className="text-sm text-gray-500">{produto.codigo_do_produto || 'N/A'}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Preço: {formatCurrency(produto.preco_venda)}</p>
            <p className="text-sm text-gray-600">Qtd: {produto.quantidade_estoque}</p>
            <div className="mt-2">
              {produto.em_baixo_estoque ? (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Baixo</span>
              ) : (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Bom</span>
              )}
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <button onClick={() => onAddStock(produto)} className="text-green-600 hover:text-green-900">Adicionar</button>
            <button onClick={() => onEditProduct(produto)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
            <button onClick={() => onDeleteProduct(produto.id_produto!)} className="text-red-600 hover:text-red-900">Excluir</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductTable;