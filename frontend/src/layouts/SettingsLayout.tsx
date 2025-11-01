import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  BuildingOffice2Icon,
  UsersIcon,
  CreditCardIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const tabs = [
  { name: 'Minha Conta', href: '/configuracoes/conta', icon: UsersIcon },
  { name: 'Usuários', href: '/configuracoes/usuarios', icon: UsersIcon },
  { name: 'Logs de Atividade', href: '/configuracoes/logs', icon: DocumentTextIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const SettingsLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Configurações
        </h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
          <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.name}
                  to={tab.href}
                  end={tab.href === '/settings'} 
                  className={({ isActive }) =>
                    classNames(
                      isActive
                        ? 'bg-gray-200 text-indigo-700' 
                        : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50',
                      'group rounded-md px-3 py-2 flex items-center text-sm font-medium'
                    )
                  }
                >
                  <tab.icon
                    className={classNames(
                      'text-gray-400 group-hover:text-gray-500',
                      'flex-shrink-0 -ml-1 mr-3 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{tab.name}</span>
                </NavLink>
              ))}
            </nav>
          </aside>

          <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
            <div className="bg-white shadow-md rounded-lg min-h-[300px]">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;