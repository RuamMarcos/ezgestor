interface FinancialsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  categories: string[];
  onAddTransaction: () => void;
}

const FinancialsHeader = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedType,
  onTypeChange,
  categories,
  onAddTransaction,
}: FinancialsHeaderProps) => {
  return (
    <div className="space-y-4 mb-4">
      <div className="flex justify-end">
        <button
          onClick={onAddTransaction}
          className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors shadow"
        >
          Novo Lançamento
        </button>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Pesquisar por descrição..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px]"
          >
            <option value="">Todas as categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary min-w-[140px]"
          >
            <option value="">Todos os tipos</option>
            <option value="entrada">Entradas</option>
            <option value="saida">Saídas</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FinancialsHeader;