import api from '../api';
import type { IAssinatura, IPagamento } from '../types/subscription';

export const getCurrentSubscription = async (): Promise<IAssinatura> => {
  const { data } = await api.get<IAssinatura>('/accounts/signature/');
  return data;
};

export const getPaymentHistory = async (): Promise<IPagamento[]> => {
  const { data } = await api.get<IPagamento[]>('/accounts/payment/');
  return data;
};

export const updatePaymentMethod = async (payload: any): Promise<void> => {
  await api.post('/accounts/update-payment-method/', payload);
};