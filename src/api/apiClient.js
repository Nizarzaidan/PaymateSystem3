import axios from "axios";

const api = axios.create({
  baseURL: "http://10.151.110.73:8080/api",
  timeout: 50000,
});

export default api;
