import axios from "axios";

const API = axios.create({
  baseURL: "https://chatsense.duckdns.org/api/",
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