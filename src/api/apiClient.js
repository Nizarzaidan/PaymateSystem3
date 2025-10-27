import axios from "axios";

const api = axios.create({
  baseURL: "http://10.66.58.196:8080/api",
  timeout: 5000,
});

export default api;
