import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { UserIcon, UsersIcon, ArrowLeftIcon, DocumentTextIcon, CreditCardIcon } from '@heroicons/react/24/outline';

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

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      {/* Sidebar de Configurações */}
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white min-h-screen">
        <div className="flex flex-col p-4">
          {/* Botão Voltar */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md px-2 py-2 text-sm font-medium mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
            Voltar
          </button>

          <h2 className="text-lg font-semibold text-gray-900 mb-4 px-2">Configurações</h2>
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  classNames(
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
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
      <div className="flex-1 bg-gray-50">
        <div className="p-6 min-h-screen">
          <Outlet /> 
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;