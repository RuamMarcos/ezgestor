import api from '../utils/api';

export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    await api.post('/accounts/password-reset/', { email });
  } catch (error: any) {
    console.error("Erro ao solicitar recuperação de senha:", error.response?.data);
    throw error.response?.data || new Error("Não foi possível solicitar a recuperação de senha.");
  }
};

export const verifyPasswordResetCode = async (email: string, code: string): Promise<void> => {
  try {
    await api.post('/accounts/password-reset/verify/', { email, code });
  } catch (error: any) {
    console.error("Erro ao verificar código:", error.response?.data);
    throw error.response?.data || new Error("Código de verificação inválido ou expirado.");
  }
};

export const confirmPasswordReset = async (email: string, code: string, password: string): Promise<void> => {
  try {
    await api.post('/accounts/password-reset/confirm/', { email, code, password });
  } catch (error: any)
 {
    console.error("Erro ao confirmar nova senha:", error.response?.data);
    throw error.response?.data || new Error("Não foi possível redefinir a senha.");
  }
};

const AuthService = {
  requestPasswordReset,
  verifyPasswordResetCode,
  confirmPasswordReset,
};

export default AuthService;