import React from 'react';

interface TeamMemberPaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onFirstPage: () => void;
  onLastPage: () => void;
}

const TeamMemberPagination = ({ currentPage, totalPages, onPrevPage, onNextPage, onFirstPage, onLastPage }: TeamMemberPaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="p-4 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onFirstPage}
          disabled={currentPage === 1}
          title="Primeira página"
          className="px-2 sm:px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:hover:bg-gray-200 dark:disabled:hover:bg-gray-700 transition-colors text-sm"
        >
          |&lt;
        </button>
        <button
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className="px-3 sm:px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-400 dark:hover:bg-gray-500 disabled:hover:bg-gray-300 dark:disabled:hover:bg-gray-600 transition-colors text-sm"
        >
          <span className="hidden sm:inline">Anterior</span>
          <span className="sm:hidden">&lt;</span>
        </button>
      </div>
      <span className="text-sm text-gray-700 dark:text-gray-300 order-first sm:order-none">
        Página {currentPage} de {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="px-3 sm:px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-400 dark:hover:bg-gray-500 disabled:hover:bg-gray-300 dark:disabled:hover:bg-gray-600 transition-colors text-sm"
        >
          <span className="hidden sm:inline">Próximo</span>
          <span className="sm:hidden">&gt;</span>
        </button>
        <button
          onClick={onLastPage}
          disabled={currentPage === totalPages}
          title="Última página"
          className="px-2 sm:px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:hover:bg-gray-200 dark:disabled:hover:bg-gray-700 transition-colors text-sm"
        >
          &gt;|
        </button>
      </div>
    </div>
  );
};

export default TeamMemberPagination;
