import {
  useEffect,
  useState,
} from "react";

import {
  Coffee,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import Swal from "sweetalert2";

import {
  toast,
} from "react-toastify";

import {
  useAuth,
} from "../context/AuthContext";


function Login() {

  const navigate =
    useNavigate();


  const {
    login,
    autenticado,
    cargando,
  } = useAuth();


  const [correo, setCorreo] =
    useState("");


  const [password, setPassword] =
    useState("");


  const [
    mostrarPassword,
    setMostrarPassword,
  ] = useState(false);


  const [
    enviando,
    setEnviando,
  ] = useState(false);

  useEffect(() => {

    if (
      !cargando &&
      autenticado
    ) {

      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );
    }

  }, [
    autenticado,
    cargando,
    navigate,
  ]);

  const manejarSubmit =
    async (event) => {

      event.preventDefault();


      if (
        !correo.trim() ||
        !password
      ) {

        await Swal.fire({

          title:
            "Datos incompletos",

          text:
            "Ingrese correo electrónico y contraseña.",

          icon:
            "warning",

          confirmButtonText:
            "Aceptar",
        });

        return;
      }


      try {

        setEnviando(true);


        await login(
          correo.trim(),
          password
        );


        toast.success(
          "Inicio de sesión correcto."
        );


        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );

      } catch (error) {

        const status =
          error.response?.status;


        const data =
          error.response?.data;


        let mensaje =
          data?.mensaje ??
          "No fue posible iniciar sesión.";


        if (
          status === 401 &&
          data?.intentosRestantes !== undefined
        ) {

          mensaje +=
            ` Intentos restantes: ${data.intentosRestantes}.`;
        }


        if (status === 423) {

          mensaje =
            data?.mensaje ??
            "El usuario se encuentra bloqueado temporalmente.";
        }


        if (status === 429) {

          mensaje =
            "Se realizaron demasiados intentos. Intente nuevamente más tarde.";
        }


        if (!error.response) {

          mensaje =
            "No fue posible comunicarse con el servidor.";
        }


        await Swal.fire({

          title:
            "No se pudo iniciar sesión",

          text:
            mensaje,

          icon:
            "error",

          confirmButtonText:
            "Aceptar",
        });

      } finally {

        setEnviando(false);
      }
    };


  return (

    <div className="login-page">

      <section className="login-side">

        <div className="login-side-content">

          <div className="login-logo">

            <Coffee size={38} />

          </div>


          <p className="login-eyebrow">
            UNIVERSIDAD MARIANO GÁLVEZ
          </p>


          <h1>
            Sistema de
            <br />
            Cafetería
          </h1>


          <p className="login-description">

            Aplicación web desarrollada con
            React + Vite consumiendo una API
            REST segura en ASP.NET Core 8.

          </p>


          <div className="technology-list">

            <span>React</span>
            <span>Vite</span>
            <span>JWT</span>
            <span>Docker</span>
            <span>Azure</span>

          </div>

        </div>

      </section>


      <section className="login-form-container">

        <form
          className="login-card"
          onSubmit={manejarSubmit}
        >

          <div className="login-card-header">

            <div className="mobile-logo">
              <Coffee size={28} />
            </div>

            <h2>
              Bienvenido
            </h2>

            <p>
              Ingrese sus credenciales para
              acceder al sistema.
            </p>

          </div>


          <div className="form-group">

            <label htmlFor="correo">
              Correo electrónico
            </label>


            <div className="input-wrapper">

              <Mail
                size={19}
                className="input-icon"
              />


              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(event) =>
                  setCorreo(
                    event.target.value
                  )
                }
                placeholder="usuario@correo.com"
                autoComplete="username"
                disabled={enviando}
              />

            </div>

          </div>


          <div className="form-group">

            <label htmlFor="password">
              Contraseña
            </label>


            <div className="input-wrapper">

              <LockKeyhole
                size={19}
                className="input-icon"
              />


              <input
                id="password"
                type={
                  mostrarPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Ingrese su contraseña"
                autoComplete="current-password"
                disabled={enviando}
              />


              <button
                type="button"
                className="password-button"
                onClick={() =>
                  setMostrarPassword(
                    (actual) => !actual
                  )
                }
                tabIndex="-1"
              >

                {mostrarPassword
                  ? <EyeOff size={19} />
                  : <Eye size={19} />
                }

              </button>

            </div>

          </div>


          <button
            type="submit"
            className="login-button"
            disabled={enviando}
          >

            {enviando
              ? "Validando..."
              : "Iniciar sesión"
            }

          </button>


          <div className="login-security">

            <LockKeyhole size={15} />

            <span>
              Acceso protegido mediante JWT
            </span>

          </div>

        </form>

      </section>

    </div>
  );
}


export default Login;