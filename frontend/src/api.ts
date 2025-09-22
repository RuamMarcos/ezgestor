import axios from "axios";

const api = axios.create({
  //baseURL: "http://localhost:8000/api", // backend Django
  baseURL: "https://ezgestor-fix-test-104520155285.southamerica-east1.run.app/api", // backend Django Production
});

export default api;
