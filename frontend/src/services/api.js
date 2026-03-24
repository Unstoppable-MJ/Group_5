import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "/api/";

const API = axios.create({
  baseURL: baseURL.endsWith("/") ? baseURL : `${baseURL}/`,
});

// Add a request interceptor to include the auth token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default API;
