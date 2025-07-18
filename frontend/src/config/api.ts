import axios from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const fetchApi = (method: string, url: string, data?: any) => {
  const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => {
      return response.data;
    },
    (error) => {
      // Handle common errors
      if (error.response?.status === 401) {
        // Remove token and redirect to login
        localStorage.removeItem("token");
        window.location.href = "/";
      }

      return Promise.reject(error);
    },
  );

  return api({
    method,
    url,
    data,
  });
};

export async function checkLoginStatus() {
  const token = localStorage.getItem("token");

  if (!token) return { loggedIn: false };
  try {
    const data: any = await fetchApi("get", "/auth/me");

    if (data?.data) {
      localStorage.setItem("user", JSON.stringify(data.data));
    } else {
      localStorage.removeItem("user");
    }

    return { loggedIn: true, user: data?.data };
  } catch {
    localStorage.removeItem("user");

    return { loggedIn: false };
  }
}
export default fetchApi;
