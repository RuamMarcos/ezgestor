import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Função para obter o IP do host de desenvolvimento
function getHostIp() {
  try {
    // A propriedade `expoConfig.hostUri` é a forma mais moderna e confiável
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      return hostUri.split(':')[0];
    }
    const manifest = Constants.manifest;
    if (manifest && typeof manifest.debuggerHost === 'string') {
      return manifest.debuggerHost.split(':')[0];
    }
  } catch (e) {
    console.error("Erro ao obter o IP do host:", e);
  }
  // Se tudo falhar, retorna nulo
  return null;
}

// Determina a URL base da API
function getApiBaseUrl() {
  // Forma segura de verificar se está no ambiente web
  if (typeof window !== 'undefined' && window.location) {
    return `http://${window.location.hostname}:8000`;
  }

  // Para nativo (iOS/Android), tenta obter o IP do host
  const hostIp = getHostIp();
  if (hostIp) {
    return `http://${hostIp}:8000`;
  }

  // Fallback final para emuladores Android que mapeiam localhost
  return 'http://10.0.2.2:8000';
}

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // Adiciona o /api ao final da URL base
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para debug (muito útil para ver as requisições saindo)
api.interceptors.request.use(
  (config) => {
    console.log(`Fazendo requisição para: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;