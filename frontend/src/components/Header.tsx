import { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { CogIcon, ArrowLeftOnRectangleIcon, SunIcon, MoonIcon, ComputerDesktopIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth(); 
  const { themeSetting, applyTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, mobileMenuRef]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">EzGestor</h1>
        
        <div className="flex items-center gap-2 md:gap-6">
          {/* Navegação Principal - Desktop */}
          <div className="hidden md:flex bg-gray-100 dark:bg-gray-700 rounded-full p-1">
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
            className="w-9 h-9 md:w-10 md:h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary text-gray-600 dark:text-gray-300"
            title="Alternar tema"
          >
            <CurrentIcon />
          </button>

          {/* Ícone de Perfil com Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-9 h-9 md:w-10 md:h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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

          {/* Botão Menu Mobile */}
          <div className="md:hidden relative" ref={mobileMenuRef}>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Bars3Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Menu Mobile Dropdown */}
            {isMobileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-50">
                <nav className="flex flex-col">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-4 py-3 text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-primary/10 text-primary border-l-4 border-primary'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;