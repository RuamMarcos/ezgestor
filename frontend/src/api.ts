import axios from "axios";

// Function to determine the baseURL dynamically
const getBaseURL = (): string => {
  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return "http://localhost:8000/api";
  } else {
    return `${window.location.origin}/api`;
  }
};

const api = axios.create({
  baseURL: getBaseURL(),
});

export default api;