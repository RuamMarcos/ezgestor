import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/vendas', label: 'Vendas' }, 
  { path: '/stock', label: 'Estoque' },
  { path: '/fluxo-de-caixa', label: 'Fluxo de Caixa' }, // Exemplo de rota futura
];

function Header() {
  return (
    <header className="bg-white rounded-2xl p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-2xl font-bold text-gray-800">EzGestor</h1>
        
        {/* Navegação Principal */}
        <div className="flex bg-gray-100 rounded-full p-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-200'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Ícone de Perfil */}
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-gray-600 font-semibold">U</span> {/* Placeholder para inicial do usuário */}
        </div>
      </div>
    </header>
  );
}

export default Header;