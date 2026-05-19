import axios from 'axios';

// Normalize API base URL:
// - In development we use the local proxy path '/api'
// - In production, VITE_API_URL may or may not include the '/api' prefix.
// Ensure the runtime base URL always points to the backend API root.
let baseURL = '/api';
if (import.meta.env.VITE_API_URL) {
  const provided = import.meta.env.VITE_API_URL;
  baseURL = provided.endsWith('/api') ? provided : `${provided.replace(/\/$/, '')}/api`;
}

const API = axios.create({ baseURL, withCredentials: true });

// simple access token store
function getAccess() {
  return localStorage.getItem('accessToken');
}

function setAccess(token) {
  if (token) localStorage.setItem('accessToken', token);
  else localStorage.removeItem('accessToken');
}

API.interceptors.request.use((config) => {
  const token = getAccess();
  if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response && err.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return API(originalRequest);
          })
          .catch((e) => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const r = await API.post('/auth/refresh');
        const newAccess = r.data.access;
        setAccess(newAccess);
        processQueue(null, newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return API(originalRequest);
      } catch (e) {
        processQueue(e, null);
        setAccess(null);
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export { API, setAccess, getAccess };
