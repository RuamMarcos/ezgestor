// frontend/src/layouts/SettingsLayout.tsx

import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  UsersIcon,
  DocumentTextIcon, // <-- 1. ADICIONEI ESTE ÍCONE
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const SettingsLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth(); // O seu arquivo já tinha isso, ótimo!

  const links = [
    {
      name: 'Perfil da Empresa',
      href: '/settings/company',
      icon: BuildingOfficeIcon,
    },
    ...(user?.is_dono // O seu arquivo já tinha essa verificação
      ? [
          {
            name: 'Gestão da Equipe',
            href: '/settings/team',
            icon: UsersIcon,
          },
          // V-- 2. ADICIONEI ESTE BLOCO PARA O NOVO LINK --V
          {
            name: 'Logs de Auditoria',
            href: '/settings/logs',
            icon: DocumentTextIcon,
          },
          // ^-- FIM DA ADIÇÃO --^
        ]
      : []),
  ];

  return (
    <div className="flex-grow bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Configurações
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Navegação Lateral */}
          <aside className="w-full md:w-1/4 lg:w-1/5">
            <nav className="space-y-1">
              {links.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    classNames(
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md'
                    )
                  }
                  end // Garante que apenas a rota exata seja 'ativa'
                >
                  <item.icon
                    className={classNames(
                      location.pathname === item.href
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Conteúdo Principal */}
          <div className="w-full md:w-3/4 lg:w-4/5">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;