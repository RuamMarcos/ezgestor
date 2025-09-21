// src/pages/Login.tsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError("Falha no login. Verifique seu e-mail e senha.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-gradient font-sans">
      <header className="fixed w-full top-0 z-50 transition-colors duration-300">
        <div className="container mx-auto px-5 py-4 flex justify-between items-center">
          <div className="invisible">
            <span className="text-2xl font-bold">EzGestor</span>
          </div>
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
            <ul className="flex items-center gap-10">
              <li><Link to="/" className="text-white font-medium hover:text-accent transition-colors">Início</Link></li>
              <li><a href="/#recursos" className="text-white font-medium hover:text-accent transition-colors">Recursos</a></li>
              <li><a href="/#sobre" className="text-white font-medium hover:text-accent transition-colors">Sobre</a></li>
            </ul>
          </div>
          <div className="hidden md:flex items-center gap-4 ml-auto">
            <Link 
              to="/login" 
              className="px-5 py-2 border border-white text-white rounded-lg font-medium hover:bg-white hover:text-[#4A4E9D] transition-all"
            >
              Entrar
            </Link>
            <Link to="/register" className="px-5 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-all">Cadastrar</Link>
          </div>
        </div>
      </header>
      
      <main className="min-h-screen flex items-center justify-center text-center pt-20">
        <div className="container mx-auto px-5">
          <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Entrar no EzGestor</h2>
              <p className="text-gray-600">Acesse sua conta e gerencie seu negócio</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 text-gray-900 placeholder-gray-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-left mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 text-gray-900 placeholder-gray-500"
                />
              </div>
              
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 focus:ring-4 focus:ring-primary/30 flex items-center justify-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            <div className="mt-8 space-y-4 text-center">
              <p className="text-gray-600">
                Não tem uma conta?
                <Link to="/register" className="text-primary font-medium hover:text-primary-dark transition-colors ml-1">
                  Cadastre-se gratuitamente
                </Link>
              </p>
              <div>
                <a href="#" className="text-sm text-gray-500 hover:text-primary transition-colors">
                  Esqueci minha senha
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


