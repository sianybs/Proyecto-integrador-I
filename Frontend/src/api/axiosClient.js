import axios from 'axios';

// Cambiá esto si tu backend corre en otro puerto/URL
const BASE_URL = 'http://localhost:4000/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
});

// Antes de cada request, si hay un token guardado, lo agrega automaticamente.
// Asi ningun componente tiene que acordarse de mandarlo a mano.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('vetcare_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el backend responde 401 (token vencido o invalido), limpiamos la sesion
// y mandamos a la persona de nuevo al login del staff.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('vetcare_token');
      localStorage.removeItem('vetcare_usuario');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
