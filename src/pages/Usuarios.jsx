import { useEffect, useState } from "react";
import { Mail, RefreshCw, ShieldCheck, UserCog, UserRound, UserX } from "lucide-react";
import Swal from "sweetalert2";

import usuarioService from "../services/usuarioService";

import "./categorias.css";
import "./usuarios.css";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const data = await usuarioService.obtener();
      setUsuarios(data);
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: error.response?.data?.mensaje ?? "No fue posible obtener los usuarios.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const estaBloqueado = (usuario) => {
    if (!usuario.bloqueadoHasta) return false;
    return new Date(usuario.bloqueadoHasta) > new Date();
  };

  const formatoFecha = (fecha) => {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleString("es-GT");
  };

  return (
    <div className="users-page">
      <div className="module-header">
        <div>
          <p className="page-eyebrow">ADMINISTRACIÓN</p>
          <h1>Usuarios</h1>
          <p>Consulta de usuarios, roles, estado de acceso e intentos fallidos.</p>
        </div>

        <button type="button" className="secondary-button" onClick={cargarUsuarios}>
          <RefreshCw size={17} />
          Actualizar
        </button>
      </div>

      <section className="data-card">
        <div className="data-card-header">
          <div>
            <div className="data-card-icon users-data-icon">
              <UserCog size={19} />
            </div>
            <div>
              <strong>Usuarios del sistema</strong>
              <span>{usuarios.length} registro{usuarios.length === 1 ? "" : "s"}</span>
            </div>
          </div>
        </div>

        {cargando ? (
          <div className="module-loading">
            <div className="spinner"></div>
            <p>Cargando usuarios...</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="empty-state">
            <UserCog size={40} />
            <strong>No hay usuarios registrados</strong>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table users-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Roles</th>
                  <th>Estado</th>
                  <th>Intentos</th>
                  <th>Bloqueado hasta</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map((usuario) => {
                  const bloqueado = estaBloqueado(usuario);

                  return (
                    <tr key={usuario.idUsuario}>
                      <td>
                        <div className="user-table-name">
                          <div className="user-table-avatar">
                            <UserRound size={17} />
                          </div>
                          <div>
                            <strong>{usuario.nombreCompleto}</strong>
                            <span>Usuario #{usuario.idUsuario}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="user-email">
                          <Mail size={14} />
                          {usuario.correo}
                        </span>
                      </td>

                      <td>
                        <div className="roles-list">
                          {usuario.roles?.map((rol) => (
                            <span key={rol} className="role-badge">
                              <ShieldCheck size={12} />
                              {rol}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td>
                        {bloqueado ? (
                          <span className="user-status blocked">
                            <UserX size={12} />
                            Bloqueado
                          </span>
                        ) : (
                          <span className={usuario.activo ? "user-status active" : "user-status inactive"}>
                            {usuario.activo ? "Activo" : "Inactivo"}
                          </span>
                        )}
                      </td>

                      <td>
                        <span className={usuario.intentosFallidos > 0 ? "failed-attempts warning" : "failed-attempts"}>
                          {usuario.intentosFallidos}
                        </span>
                      </td>

                      <td>
                        <span className="blocked-until">
                          {bloqueado ? formatoFecha(usuario.bloqueadoHasta) : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Usuarios;