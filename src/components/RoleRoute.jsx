import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";


function RoleRoute({ roles = [] }) {

  const {
    usuario,
  } = useAuth();


  const autorizado =
    roles.some(
      (rol) =>
        usuario?.roles?.includes(rol)
    );


  if (!autorizado) {

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }


  return <Outlet />;
}


export default RoleRoute;