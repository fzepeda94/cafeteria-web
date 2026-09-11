import {
  LogOut,
  ShieldCheck,
} from "lucide-react";

import {
  Outlet,
  useNavigate,
} from "react-router-dom";

import Swal from "sweetalert2";

import Sidebar from "./Sidebar";

import {
  useAuth,
} from "../../context/AuthContext";


function Layout() {

  const {
    usuario,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();

  const cerrarSesion = async () => {

    const resultado =
      await Swal.fire({

        title:
          "¿Cerrar sesión?",

        text:
          "Se finalizará la sesión actual.",

        icon:
          "question",

        showCancelButton:
          true,

        confirmButtonText:
          "Sí, cerrar sesión",

        cancelButtonText:
          "Cancelar",

        reverseButtons:
          true,
      });


    if (!resultado.isConfirmed) {
      return;
    }


    logout();

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };


  const rolPrincipal =
    usuario?.roles?.[0] ??
    "USUARIO";


  return (

    <div className="app-shell">

      <Sidebar />


      <div className="main-area">

        <header className="topbar">

          <div>

            <p className="topbar-label">
              Sistema de Gestión
            </p>

            <h2>
              Cafetería
            </h2>

          </div>


          <div className="topbar-user">

            <div className="user-info">

              <strong>
                {usuario?.nombreCompleto}
              </strong>

              <span>
                <ShieldCheck size={14} />

                {rolPrincipal}
              </span>

            </div>


            <button
              type="button"
              className="logout-button"
              onClick={cerrarSesion}
              title="Cerrar sesión"
            >

              <LogOut size={19} />

            </button>

          </div>

        </header>


        <main className="content">

          <Outlet />

        </main>

      </div>

    </div>
  );
}


export default Layout;