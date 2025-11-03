import api from './api';
import type { IAssinatura, IPagamento } from '../types/subscription';

export const getCurrentSubscription = async (): Promise<IAssinatura> => {
  const { data } = await api.get<IAssinatura>('/accounts/signature/');
  return data;
};

export const getPaymentHistory = async (): Promise<IPagamento[]> => {
  const { data } = await api.get<IPagamento[]>('/accounts/payment/');
  return data;
};

interface UpdatePaymentPayload {
  numero: string;
  validade: string;
  cvv: string;
  nome: string;
}

export const updatePaymentMethod = async (
  payload: UpdatePaymentPayload
): Promise<void> => {
  // const cleanedPayload = {
  //   ...payload,
  //   numero: payload.numero.replace(/\D/g, ''),
  //   validade: payload.validade, // O backend espera MM/AA
  //   cvv: payload.cvv,
  // };
  await api.post('/accounts/update-payment-method/', payload);
};