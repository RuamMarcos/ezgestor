interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onFirstPage: () => void;
  onLastPage: () => void;
}

const FinancialsPagination = ({ currentPage, totalPages, onPrevPage, onNextPage, onFirstPage, onLastPage }: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="p-4 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-2">
      <span className="text-sm text-gray-700 dark:text-gray-300 sm:hidden mb-1">
        Página {currentPage} de {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={onFirstPage}
          disabled={currentPage === 1}
          title="Primeira página"
          className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:hover:bg-gray-200 dark:disabled:hover:bg-gray-700 transition-colors text-sm"
        >
          |&lt;
        </button>
        <button
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className="px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-400 dark:hover:bg-gray-500 disabled:hover:bg-gray-300 dark:disabled:hover:bg-gray-600 transition-colors text-sm"
        >
          Anterior
        </button>
        <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300 px-2">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-400 dark:hover:bg-gray-500 disabled:hover:bg-gray-300 dark:disabled:hover:bg-gray-600 transition-colors text-sm"
        >
          Próximo
        </button>
        <button
          onClick={onLastPage}
          disabled={currentPage === totalPages}
          title="Última página"
          className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:hover:bg-gray-200 dark:disabled:hover:bg-gray-700 transition-colors text-sm"
        >
          &gt;|
        </button>
      </div>
    </div>
  );
};

export default FinancialsPagination;