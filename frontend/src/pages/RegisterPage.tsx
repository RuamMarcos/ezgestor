// src/pages/RegisterPage.tsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { aplicarMascaraCnpj} from "../utils/masks";

const RegisterPage = () => {
  // 1. Estados para os campos do formulário
  const [formData, setFormData] = useState({
    nome_fantasia: '',
    cnpj: '',
    admin_first_name: '',
    admin_email: '',
    admin_password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. Acessa a função de registro e o hook de navegação
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'cnpj') {
      setFormData({ ...formData, [name]: aplicarMascaraCnpj(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.admin_password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    
    setLoading(true);

    try {
      // Prepara os dados para enviar à API
      const [firstName, ...lastNameParts] = formData.admin_first_name.split(' ');
      const lastName = lastNameParts.join(' ') || firstName;

      const apiData = {
        nome_fantasia: formData.nome_fantasia,
        razao_social: `${formData.nome_fantasia} LTDA`, // Lógica simples como no backend
        cnpj: formData.cnpj,
        admin_email: formData.admin_email,
        admin_first_name: firstName,
        admin_last_name: lastName,
        admin_password: formData.admin_password,
      };

      // 3. Chama a função de registro do contexto
      await register(apiData);

      // 4. Se o registro for bem-sucedido, navega para a página de planos
      navigate('/plans');

    } catch (err: any) {
      console.error("Falha no registro:", err);
      
      // Lógica aprimorada para extrair erros
      let errorMessage = 'Não foi possível criar a conta. Verifique os dados e tente novamente.';
      if (err.response?.data) {
        const errorData = err.response.data;
        // Concatena os erros de campo em uma única string
        const fieldErrors = Object.values(errorData).flat().join(' ');
        if (fieldErrors) {
          errorMessage = fieldErrors;
        }
      }
      setError(errorMessage);
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
                
            </div>
        </header>

        <main className="min-h-screen flex items-center justify-center text-center pt-28 pb-10">
            <div className="container mx-auto px-5">
                <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 lg:p-12">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Criar Conta no EzGestor</h2>
                        <p className="text-gray-600">Cadastre sua empresa e comece a gestão inteligente</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="nome_fantasia" className="block text-left text-sm font-medium text-gray-700 mb-2">
                                    Nome da Empresa
                                </label>
                                <input
                                    type="text"
                                    id="nome_fantasia"
                                    name="nome_fantasia"
                                    value={formData.nome_fantasia}
                                    onChange={handleChange}
                                    placeholder="Nome da sua empresa"
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 text-gray-900 placeholder-gray-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="cnpj" className="block text-left text-sm font-medium text-gray-700 mb-2">
                                    CNPJ
                                </label>
                                <input
                                    type="text"
                                    id="cnpj"
                                    name="cnpj"
                                    value={formData.cnpj}
                                    onChange={handleChange}
                                    placeholder="00.000.000/0001-00"
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 text-gray-900 placeholder-gray-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="admin_first_name" className="block text-left text-sm font-medium text-gray-700 mb-2">
                                    Seu Nome Completo
                                </label>
                                <input
                                    type="text"
                                    id="admin_first_name"
                                    name="admin_first_name"
                                    value={formData.admin_first_name}
                                    onChange={handleChange}
                                    placeholder="Seu nome completo"
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 text-gray-900 placeholder-gray-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="admin_email" className="block text-left text-sm font-medium text-gray-700 mb-2">
                                    E-mail
                                </label>
                                <input
                                    type="email"
                                    id="admin_email"
                                    name="admin_email"
                                    value={formData.admin_email}
                                    onChange={handleChange}
                                    placeholder="seu@email.com"
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 text-gray-900 placeholder-gray-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="admin_password" className="block text-left text-sm font-medium text-gray-700 mb-2">
                                Senha
                            </label>
                            <input
                                type="password"
                                id="admin_password"
                                name="admin_password"
                                value={formData.admin_password}
                                onChange={handleChange}
                                placeholder="Mínimo 8 caracteres"
                                required
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 text-gray-900 placeholder-gray-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-left text-sm font-medium text-gray-700 mb-2">
                                Confirmar Senha
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirme sua senha"
                                required
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 text-gray-900 placeholder-gray-500"
                            />
                        </div>
                        
                        {error && <p className="text-red-500 text-sm">{error}</p>}

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
                                    Criando conta...
                                </>
                            ) : (
                                'Criar Conta'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Já tem uma conta?
                            <Link to="/login" className="text-primary font-medium hover:text-primary-dark transition-colors ml-1">
                                Faça login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
}

export default RegisterPage;

