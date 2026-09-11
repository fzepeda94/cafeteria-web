import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error(
    "No se encontró la variable de entorno VITE_API_URL."
  );
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const sesionGuardada =
      sessionStorage.getItem("cafeteria_sesion");

    if (sesionGuardada) {
      try {
        const sesion = JSON.parse(sesionGuardada);

        if (sesion?.token) {
          config.headers.Authorization =
            `Bearer ${sesion.token}`;
        }
      } catch {
        sessionStorage.removeItem(
          "cafeteria_sesion"
        );
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;

    const url =
      error.config?.url ?? "";

    const esLogin =
      url.includes("/api/Auth/login");

    if (status === 401 && !esLogin) {
      sessionStorage.removeItem(
        "cafeteria_sesion"
      );

      if (
        window.location.pathname !== "/login"
      ) {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;