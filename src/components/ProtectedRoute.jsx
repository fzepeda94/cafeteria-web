import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function ProtectedRoute() {

  const {
    autenticado,
    cargando,
  } = useAuth();


  if (cargando) {

    return (

      <div className="loading-page">

        <div className="spinner"></div>

        <p>
          Validando sesión...
        </p>

      </div>
    );
  }


  if (!autenticado) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  return <Outlet />;
}


export default ProtectedRoute;