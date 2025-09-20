import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setError('E-mail ou senha inválidos.');
        setLoading(false);
        return;
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex flex-col">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-transparent">
        <nav className="container mx-auto px-5 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-3 text-white text-2xl font-bold">
            <svg width="40" height="40" viewBox="0 0 100 100" className="text-white">
              <ellipse cx="50" cy="50" rx="45" ry="25" fill="none" stroke="currentColor" strokeWidth="8" transform="rotate(-20 50 50)" />
              <text x="25" y="60" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" fill="currentColor">Ez</text>
            </svg>
            EzGestor
          </a>
          <div className="flex items-center gap-4">
            <Link
  to="/login"
  className="px-5 py-2 border border-white text-white rounded-lg font-medium hover:bg-white hover:text-primary transition-all"
>
  Entrar
</Link>
            <a href="/register" className="px-5 py-2 bg-accent text-white rounded-lg font-medium hover:bg-[#7b4cdb] transition-all">
              Cadastrar
            </a>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center pt-20 px-5">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary mb-2">Entrar no EzGestor</h2>
              <p className="text-gray-600">Acesse sua conta e gerencie seu negócio</p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Sua senha"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    Lembrar de mim
                  </label>
                </div>
                <a href="#" className="text-sm text-accent hover:text-[#7b4cdb] transition-colors">
                  Esqueci minha senha
                </a>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-lg font-semibold transition-all transform hover:scale-[1.02] focus:ring-2 focus:ring-primary focus:ring-offset-2"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium transition-all border border-gray-200">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </button>
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Não tem uma conta?
                <a href="/register" className="text-accent hover:text-[#7b4cdb] font-semibold transition-colors">
                  Cadastre-se gratuitamente
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;