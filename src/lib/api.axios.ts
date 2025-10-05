import axios from "axios";

const authUrl = import.meta.env.VITE_AUTH_API ?? "";

const api = axios.create({
  baseURL: authUrl,
});

export default api;
