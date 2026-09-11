import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import authService from "../services/authService";

const AuthContext = createContext(null);

const STORAGE_KEY = "cafeteria_sesion";

const obtenerSesionGuardada = () => {

  const valor =
    sessionStorage.getItem(STORAGE_KEY);

  if (!valor) {
    return null;
  }

  try {
    return JSON.parse(valor);
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);

    return null;
  }
};

export function AuthProvider({ children }) {

  const [sesion, setSesion] = useState(
    obtenerSesionGuardada
  );

  const [cargando, setCargando] =
    useState(true);

  useEffect(() => {

    const validarSesion = async () => {

      const sesionActual =
        obtenerSesionGuardada();

      if (!sesionActual?.token) {
        setSesion(null);
        setCargando(false);

        return;
      }

      try {

        const usuario =
          await authService.me();

        const sesionActualizada = {
          ...sesionActual,

          idUsuario:
            usuario.idUsuario,

          nombreCompleto:
            usuario.nombreCompleto,

          correo:
            usuario.correo,

          roles:
            usuario.roles ?? [],
        };

        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            sesionActualizada
          )
        );

        setSesion(
          sesionActualizada
        );

      } catch {

        sessionStorage.removeItem(
          STORAGE_KEY
        );

        setSesion(null);
      }

      setCargando(false);
    };


    validarSesion();

  }, []);

  const login = async (
    correo,
    password
  ) => {

    const data =
      await authService.login(
        correo,
        password
      );


    const nuevaSesion = {

      token:
        data.token,

      expiraEn:
        data.expiraEn,

      idUsuario:
        data.idUsuario,

      nombreCompleto:
        data.nombreCompleto,

      correo:
        data.correo,

      roles:
        data.roles ?? [],
    };


    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        nuevaSesion
      )
    );


    setSesion(
      nuevaSesion
    );


    return nuevaSesion;
  };

  const logout = () => {

    sessionStorage.removeItem(
      STORAGE_KEY
    );

    setSesion(null);
  };

  const tieneRol = (rol) => {

    if (!sesion?.roles) {
      return false;
    }

    return sesion.roles.includes(
      rol
    );
  };

  const value = {

    sesion,

    usuario:
      sesion,

    token:
      sesion?.token ?? null,

    autenticado:
      Boolean(sesion?.token),

    cargando,

    login,

    logout,

    tieneRol,
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context =
    useContext(AuthContext);

  if (!context) {

    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider."
    );
  }

  return context;
}