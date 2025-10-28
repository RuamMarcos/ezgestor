import React, { useState } from 'react';
import api from '../../api';

interface PasswordResetModalProps {
  onClose: () => void;
}

type Step = 'email' | 'code' | 'new_password' | 'success';

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await api.post('/accounts/password-reset/', { email });
      setMessage(response.data.detail || "Caso esse e-mail exista, um código foi enviado.");
      setStep('code');
    } catch (err) {
      setError('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('O código deve ter 6 dígitos.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.post('/accounts/password-reset/validate-code/', { email, code });
      setMessage('');
      setStep('new_password');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Código inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await api.post('/accounts/password-reset/confirm/', { 
        email, 
        code, 
        new_password: newPassword 
      });
      setMessage(response.data.detail || "Senha alterada com sucesso!");
      setStep('success');
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Não foi possível alterar a senha. Tente o processo novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'email':
        return (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left mb-2">
                E-mail de recuperação
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-cta hover:bg-accent text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>
          </form>
        );
      
      case 'code':
        return (
          <form onSubmit={handleCodeSubmit} className="space-y-6">
            {message && <p className="text-green-600 text-sm text-center">{message}</p>}
            <p className="text-gray-600 text-sm text-center">
              Enviamos um código de 6 dígitos para {email}.
            </p>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 text-left mb-2">
                Código de verificação
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                required
                maxLength={6}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-cta hover:bg-accent text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50"
            >
              {loading ? 'Validando...' : 'Validar código'}
            </button>
          </form>
        );

      case 'new_password':
        return (
          <form onSubmit={handleNewPasswordSubmit} className="space-y-6">
            <p className="text-gray-600 text-sm text-center">
              Código validado! Defina sua nova senha.
            </p>
            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 text-left mb-2">
                Nova Senha
              </label>
              <input
                type="password"
                id="new_password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 text-left mb-2">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                id="confirm_password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-cta hover:bg-accent text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        );
      
      case 'success':
        return (
           <div className="space-y-4 text-center">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">Sucesso!</h3>
              <p className="text-gray-600">{message}</p>
              <p className="text-gray-500 text-sm">Você já pode fazer login com sua nova senha.</p>
           </div>
        );
    }
  };

  return (

    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >

      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
        onClick={(e) => e.stopPropagation()}
      >

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Fechar modal"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Recuperar Senha</h2>
          {step === 'email' && (
             <p className="text-gray-600">Insira seu e-mail para continuar</p>
          )}
        </div>
        
        {renderStep()}

      </div>
    </div>
  );
};

export default PasswordResetModal;