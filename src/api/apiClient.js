import axios from "axios";

const BASE_URL = "http://10.174.216.196:8080/api";

// Instance axios dengan config lengkap
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});


export { BASE_URL };
export default api;

