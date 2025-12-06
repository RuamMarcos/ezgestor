import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { UserIcon, UsersIcon, ArrowLeftIcon, DocumentTextIcon, CreditCardIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Minha Conta', href: '/configuracoes/conta', icon: UserIcon },
  { name: 'Usuários', href: '/configuracoes/usuarios', icon: UsersIcon },
  { name: 'Logs do Sistema', href: '/configuracoes/logs', icon: DocumentTextIcon },
  { name: 'Assinatura', href: '/configuracoes/assinatura', icon: CreditCardIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const SettingsLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-full min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Overlay para mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar de Configurações - Mobile */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50
        w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 min-h-screen
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col p-4">
          {/* Header do Sidebar Mobile */}
          <div className="flex items-center justify-between md:hidden mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Menu</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Botão Voltar */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md px-2 py-2 text-sm font-medium mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
            Voltar
          </button>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 px-2">Configurações</h2>
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  classNames(
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100',
                    'group flex items-center rounded-md px-2 py-2 text-sm font-medium'
                  )
                }
              >
                <item.icon
                  className={classNames(
                    'mr-3 h-6 w-6 flex-shrink-0'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header Mobile com botão de menu */}
        <div className="md:hidden sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Bars3Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Configurações</h1>
        </div>

        <div className="p-4 md:p-6 min-h-screen">
          <Outlet /> 
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;