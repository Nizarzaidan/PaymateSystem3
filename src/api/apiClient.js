import axios from "axios";

const api = axios.create({
  baseURL: "http://10.139.164.73:8080/api",
  timeout: 5000,
});

export default api;
