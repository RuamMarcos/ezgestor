import { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { CogIcon, ArrowLeftOnRectangleIcon, SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

const allNavItems = [
  { path: '/dashboard', label: 'Dashboard', allowedRoles: ['administrador'] },
  { path: '/vendas', label: 'Vendas', allowedRoles: ['administrador', 'funcionario'] },
  { path: '/stock', label: 'Estoque', allowedRoles: ['administrador', 'funcionario'] }, 
  { path: '/fluxo-de-caixa', label: 'Fluxo de Caixa', allowedRoles: ['administrador'] },
];

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-gray-600 dark:text-gray-300"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { logout, user } = useAuth(); 
  const { themeSetting, applyTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = allNavItems.filter(item => 
    user?.nivel_acesso && item.allowedRoles.includes(user.nivel_acesso)
  );

  const getNextTheme = () => {
    switch(themeSetting) {
      case 'light': return 'dark' as const;
      case 'dark': return 'system' as const;
      case 'system': return 'light' as const;
      default: return 'light' as const;
    }
  };

  const handleToggleTheme = () => {
    const nextTheme = getNextTheme();
    applyTheme(nextTheme);
  };

  const CurrentIcon = () => {
    switch(themeSetting) {
      case 'light': return <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />;
      case 'dark': return <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />;
      case 'system': return <ComputerDesktopIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />;
      default: return <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />;
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">EzGestor</h1>
        
        <div className="flex items-center gap-6">
          {/* Navegação Principal */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Botão de Tema */}
          <button
            onClick={handleToggleTheme}
            className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary text-gray-600 dark:text-gray-300"
            title="Alternar tema"
          >
            <CurrentIcon />
          </button>

          {/* Ícone de Perfil com Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <UserIcon />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                
                {/* Link de Configurações */}
                {user?.nivel_acesso === 'administrador' && (
                  <Link
                    to="/configuracoes"
                    onClick={() => setIsDropdownOpen(false)} 
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <CogIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    Configurações
                  </Link>
                )}

                {/* Botão de Logout */}
                <button
                  onClick={() => {
                    logout();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <ArrowLeftOnRectangleIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;