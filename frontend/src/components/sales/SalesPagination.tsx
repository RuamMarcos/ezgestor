import React from 'react';

interface SalesPaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onFirstPage: () => void;
  onLastPage: () => void;
}

const SalesPagination = ({ currentPage, totalPages, onPrevPage, onNextPage, onFirstPage, onLastPage }: SalesPaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="p-4 flex justify-center items-center space-x-4">
      <button
        onClick={onFirstPage}
        disabled={currentPage === 1}
        title="Primeira página"
        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
      >
        |&lt;
      </button>
      <button
        onClick={onPrevPage}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
      >
        Anterior
      </button>
      <span className="text-gray-700">
        Página {currentPage} de {totalPages}
      </span>
      <button
        onClick={onNextPage}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
      >
        Próximo
      </button>
      <button
        onClick={onLastPage}
        disabled={currentPage === totalPages}
        title="Última página"
        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
      >
        &gt;|
      </button>
    </div>
  );
};

export default SalesPagination;
