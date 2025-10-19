import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Função para obter o IP do host de desenvolvimento automaticamente
function getHostIp() {
  try {
    // 1. Primeira tentativa: usar expoConfig.hostUri (Expo SDK 49+)
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(":")[0];
      console.log(`✅ IP obtido do expoConfig.hostUri: ${ip}`);
      return ip;
    }

    // 2. Segunda tentativa: usar manifest2.extra.expoGo (Expo Go)
    const manifest2 = Constants.manifest2;
    if (manifest2?.extra?.expoGo?.debuggerHost) {
      const ip = manifest2.extra.expoGo.debuggerHost.split(":")[0];
      console.log(`✅ IP obtido do manifest2.extra.expoGo: ${ip}`);
      return ip;
    }

    // 3. Terceira tentativa: usar manifest.debuggerHost (legacy)
    const manifest = Constants.manifest;
    if (manifest && typeof manifest.debuggerHost === "string") {
      const ip = manifest.debuggerHost.split(":")[0];
      console.log(`✅ IP obtido do manifest.debuggerHost: ${ip}`);
      return ip;
    }

    // 4. Quarta tentativa: usar experienceUrl
    if (Constants.experienceUrl) {
      const url = new URL(Constants.experienceUrl);
      const ip = url.hostname;
      console.log(`✅ IP obtido do experienceUrl: ${ip}`);
      return ip;
    }
  } catch (e) {
    console.error("❌ Erro ao obter o IP do host:", e);
  }

  console.log("⚠️ Não foi possível detectar o IP automaticamente");
  return null;
}

// Função para tentar importar configuração personalizada (opcional)
function tryGetDevConfig() {
  try {
    // Tenta importar o arquivo de config personalizado
    const config = require("./config");
    return config.getDevIp();
  } catch (e) {
    // Arquivo não existe ou erro na importação - isso é normal
    console.log("💡 Arquivo de config personalizado não encontrado (opcional)");
    return null;
  }
}

// Determina a URL base da API
function getApiBaseUrl() {
  const BACKEND_PORT = 8000;

  // 0. Highest priority: explicit public env var provided by Expo (build/runtime)
  // Accept either a full URL (http://host:port) or just a hostname/IP (192.168.x.x)
  const envBase = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envBase && typeof envBase === "string" && envBase.trim()) {
    const val = envBase.trim();
    const isFullUrl = /^https?:\/\//i.test(val);
    const url = isFullUrl ? val.replace(/\/$/, "") : `http://${val}:${BACKEND_PORT}`;
    console.log(`🔧 URL da API via EXPO_PUBLIC_API_BASE_URL: ${url}`);
    return url;
  }

  // 0.1 Alternate env just for host/ip
  const envHost = process.env.EXPO_PUBLIC_API_HOST;
  if (envHost && typeof envHost === "string" && envHost.trim()) {
    const url = `http://${envHost.trim()}:${BACKEND_PORT}`;
    console.log(`🔧 URL da API via EXPO_PUBLIC_API_HOST: ${url}`);
    return url;
  }

  // 1. Para ambiente web (frontend React)
  if (typeof window !== "undefined" && window.location) {
    const url = `http://${window.location.hostname}:${BACKEND_PORT}`;
    console.log(`🌐 URL para web: ${url}`);
    return url;
  }

  // 2. Para mobile: tenta detecção automática do IP, com ajustes para emuladores
  const hostIp = getHostIp();
  if (hostIp) {
    let resolvedHost = hostIp;
    // Em emulador Android, localhost/127.0.0.1/::1 precisam virar 10.0.2.2
    if (Platform.OS === 'android' && (hostIp === 'localhost' || hostIp === '127.0.0.1' || hostIp === '::1')) {
      resolvedHost = '10.0.2.2';
      console.log(`🔁 Ajustando host para emulador Android: ${hostIp} -> ${resolvedHost}`);
    }
    const url = `http://${resolvedHost}:${BACKEND_PORT}`;
    console.log(`📱 URL automática para mobile: ${url}`);
    return url;
  }

  // 3. Fallback: tenta configuração personalizada
  const devIp = tryGetDevConfig();
  if (devIp) {
    const url = `http://${devIp}:${BACKEND_PORT}`;
    console.log(`⚙️ URL do arquivo de config: ${url}`);
    return url;
  }

  // 4. Fallback final para emuladores
  if (Platform.OS === "android") {
    const fallbackUrl = `http://10.0.2.2:${BACKEND_PORT}`;
    console.log(`🤖 URL fallback Android: ${fallbackUrl}`);
    return fallbackUrl;
  } else {
    const fallbackUrl = `http://localhost:${BACKEND_PORT}`;
    console.log(`🍎 URL fallback iOS: ${fallbackUrl}`);
    return fallbackUrl;
  }
}

const API_BASE_URL = getApiBaseUrl();
console.log(`API_BASE_URL configurada como: ${API_BASE_URL}`);

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // Adiciona o /api ao final da URL base
  timeout: 10000,
});

// Interceptor para debug (muito útil para ver as requisições saindo)
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 Fazendo requisição para: ${config.baseURL}${config.url}`);
    console.log(`Método: ${config.method?.toUpperCase()}`);
    if (config.data) {
      console.log(`Dados enviados:`, config.data);
    }
    return config;
  },
  (error) => {
    console.error("❌ Erro na requisição:", error);
    return Promise.reject(error);
  }
);

// Interceptor para debug das respostas
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Resposta recebida de: ${response.config.url}`);
    console.log(`Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error("❌ Erro na resposta:", error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Dados do erro:`, error.response.data);
    } else if (error.request) {
      console.error("Nenhuma resposta recebida:", error.request);
    }
    return Promise.reject(error);
  }
);

export default api;
