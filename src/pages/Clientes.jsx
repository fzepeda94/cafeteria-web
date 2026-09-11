import { useEffect, useState } from "react";
import {
  CirclePlus,
  Edit3,
  Mail,
  Phone,
  Power,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import clienteService from "../services/clienteService";
import { useAuth } from "../context/AuthContext";

import "./categorias.css";
import "./clientes.css";

const formularioInicial = {
  nombre: "",
  nit: "",
  telefono: "",
  email: "",
};

function Clientes() {
  const { tieneRol } = useAuth();
  const esAdministrador = tieneRol("ADMINISTRADOR");

  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [buscar, setBuscar] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioInicial);

  const obtenerMensajeError = (error, mensajePredeterminado) => {
    if (!error.response) return "No fue posible comunicarse con el servidor.";

    if (error.response?.data?.mensaje) {
      return error.response.data.mensaje;
    }

    if (error.response?.data?.errors) {
      const errores = Object.values(error.response.data.errors).flat().join(" ");
      if (errores) return errores;
    }

    return mensajePredeterminado;
  };

  const cargarClientes = async (filtros = null) => {
    try {
      setCargando(true);

      const valores = filtros ?? {
        buscar,
        activo: filtroEstado,
      };

      const data = await clienteService.obtener(valores);
      setClientes(data);
    } catch (error) {
      console.error(error);

      await Swal.fire({
        title: "Error",
        text: obtenerMensajeError(error, "No fue posible obtener los clientes."),
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarClientes({ buscar: "", activo: "" });
  }, []);

  const manejarBusqueda = async (event) => {
    event.preventDefault();
    await cargarClientes();
  };

  const limpiarFiltros = async () => {
    setBuscar("");
    setFiltroEstado("");
    await cargarClientes({ buscar: "", activo: "" });
  };

  const abrirNuevoCliente = () => {
    setIdEditando(null);
    setFormulario(formularioInicial);
    setMostrarModal(true);
  };

  const abrirEditarCliente = async (id) => {
    try {
      const cliente = await clienteService.obtenerPorId(id);

      setIdEditando(id);
      setFormulario({
        nombre: cliente.nombre ?? "",
        nit: cliente.nit ?? "",
        telefono: cliente.telefono ?? "",
        email: cliente.email ?? "",
      });

      setMostrarModal(true);
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: obtenerMensajeError(error, "No fue posible obtener el cliente."),
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };

  const cerrarModal = () => {
    if (guardando) return;

    setMostrarModal(false);
    setIdEditando(null);
    setFormulario(formularioInicial);
  };

  const manejarCambioFormulario = (event) => {
    const { name, value } = event.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));
  };

  const guardarCliente = async (event) => {
    event.preventDefault();

    const nombre = formulario.nombre.trim();
    const nit = formulario.nit.trim().toUpperCase();
    const telefono = formulario.telefono.trim();
    const email = formulario.email.trim().toLowerCase();

    if (!nombre) {
      await Swal.fire({
        title: "Datos incompletos",
        text: "Ingrese el nombre del cliente.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    if (nombre.length > 150) {
      await Swal.fire({
        title: "Nombre inválido",
        text: "El nombre no puede superar los 150 caracteres.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    if (!nit) {
      await Swal.fire({
        title: "Datos incompletos",
        text: "Ingrese el NIT del cliente o CF.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    if (nit.length > 20) {
      await Swal.fire({
        title: "NIT inválido",
        text: "El NIT no puede superar los 20 caracteres.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    if (telefono.length > 20) {
      await Swal.fire({
        title: "Teléfono inválido",
        text: "El teléfono no puede superar los 20 caracteres.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    if (email.length > 150) {
      await Swal.fire({
        title: "Correo inválido",
        text: "El correo no puede superar los 150 caracteres.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      await Swal.fire({
        title: "Correo inválido",
        text: "Ingrese una dirección de correo electrónico válida.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    const datos = {
      nombre,
      nit,
      telefono: telefono || null,
      email: email || null,
    };

    try {
      setGuardando(true);

      if (idEditando) {
        const resultado = await clienteService.modificar(idEditando, datos);
        toast.success(resultado.mensaje ?? "Cliente actualizado correctamente.");
      } else {
        const resultado = await clienteService.crear(datos);
        toast.success(resultado.mensaje ?? "Cliente registrado correctamente.");
      }

      setMostrarModal(false);
      setIdEditando(null);
      setFormulario(formularioInicial);

      await cargarClientes();
    } catch (error) {
      await Swal.fire({
        title: idEditando ? "No se pudo actualizar" : "No se pudo registrar",
        text: obtenerMensajeError(
          error,
          "Ocurrió un error al guardar el cliente."
        ),
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (cliente) => {
    const nuevoEstado = !cliente.activo;

    const resultado = await Swal.fire({
      title: nuevoEstado ? "¿Activar cliente?" : "¿Desactivar cliente?",
      text: nuevoEstado
        ? `Se activará "${cliente.nombre}".`
        : `Se desactivará "${cliente.nombre}".`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: nuevoEstado ? "Sí, activar" : "Sí, desactivar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!resultado.isConfirmed) return;

    try {
      const response = await clienteService.cambiarEstado(
        cliente.idCliente,
        nuevoEstado
      );

      toast.success(response.mensaje ?? "Estado actualizado correctamente.");
      await cargarClientes();
    } catch (error) {
      await Swal.fire({
        title: "No se pudo cambiar el estado",
        text: obtenerMensajeError(
          error,
          "Ocurrió un error al cambiar el estado del cliente."
        ),
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };

  return (
    <div className="clients-page">
      <div className="module-header">
        <div>
          <p className="page-eyebrow">OPERACIÓN</p>
          <h1>Clientes</h1>
          <p>
            Registro y mantenimiento de clientes utilizados en los pedidos de
            la cafetería.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={abrirNuevoCliente}
        >
          <CirclePlus size={18} />
          Nuevo cliente
        </button>
      </div>

      <section className="filters-card">
        <form className="client-filters" onSubmit={manejarBusqueda}>
          <div className="category-search">
            <Search size={18} />
            <input
              type="text"
              value={buscar}
              onChange={(event) => setBuscar(event.target.value)}
              placeholder="Nombre, NIT o correo..."
            />
          </div>

          <select
            value={filtroEstado}
            onChange={(event) => setFiltroEstado(event.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>

          <button type="submit" className="secondary-button">
            <Search size={17} />
            Buscar
          </button>

          <button
            type="button"
            className="icon-text-button"
            onClick={limpiarFiltros}
          >
            <RefreshCw size={17} />
            Limpiar
          </button>
        </form>
      </section>

      <section className="data-card">
        <div className="data-card-header">
          <div>
            <div className="data-card-icon client-data-icon">
              <Users size={19} />
            </div>

            <div>
              <strong>Listado de clientes</strong>
              <span>
                {clientes.length} registro{clientes.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>

        {cargando ? (
          <div className="module-loading">
            <div className="spinner"></div>
            <p>Cargando clientes...</p>
          </div>
        ) : clientes.length === 0 ? (
          <div className="empty-state">
            <Users size={40} />
            <strong>No se encontraron clientes</strong>
            <span>
              Modifique los filtros o registre un nuevo cliente.
            </span>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table clients-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>NIT</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Estado</th>
                  <th className="client-actions-column">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.idCliente}>
                    <td>
                      <div className="client-name-cell">
                        <div className="client-avatar">
                          {cliente.nombre?.charAt(0)?.toUpperCase() ?? "C"}
                        </div>

                        <div>
                          <strong>{cliente.nombre}</strong>
                          <span>Cliente #{cliente.idCliente}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="nit-badge">{cliente.nit}</span>
                    </td>

                    <td>
                      {cliente.telefono ? (
                        <span className="contact-cell">
                          <Phone size={14} />
                          {cliente.telefono}
                        </span>
                      ) : (
                        <span className="no-data">Sin teléfono</span>
                      )}
                    </td>

                    <td>
                      {cliente.email ? (
                        <span className="contact-cell">
                          <Mail size={14} />
                          {cliente.email}
                        </span>
                      ) : (
                        <span className="no-data">Sin correo</span>
                      )}
                    </td>

                    <td>
                      <span
                        className={
                          cliente.activo
                            ? "status-badge active"
                            : "status-badge inactive"
                        }
                      >
                        {cliente.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="table-action edit"
                          title="Editar cliente"
                          onClick={() => abrirEditarCliente(cliente.idCliente)}
                        >
                          <Edit3 size={17} />
                        </button>

                        {esAdministrador && (
                          <button
                            type="button"
                            className={
                              cliente.activo
                                ? "table-action deactivate"
                                : "table-action activate"
                            }
                            title={
                              cliente.activo
                                ? "Desactivar cliente"
                                : "Activar cliente"
                            }
                            onClick={() => cambiarEstado(cliente)}
                          >
                            <Power size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {mostrarModal && (
        <div className="modal-backdrop" onMouseDown={cerrarModal}>
          <div
            className="client-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">
                  {idEditando ? "EDITAR REGISTRO" : "NUEVO REGISTRO"}
                </p>

                <h2>
                  {idEditando ? "Editar cliente" : "Nuevo cliente"}
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={cerrarModal}
                disabled={guardando}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={guardarCliente}>
              <div className="modal-body">
                <div className="module-form-group">
                  <label htmlFor="nombre">
                    Nombre <span>*</span>
                  </label>

                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={formulario.nombre}
                    onChange={manejarCambioFormulario}
                    maxLength={150}
                    placeholder="Ej. Juan Pérez"
                    autoFocus
                    disabled={guardando}
                  />

                  <small>{formulario.nombre.length}/150 caracteres</small>
                </div>

                <div className="client-form-grid">
                  <div className="module-form-group">
                    <label htmlFor="nit">
                      NIT <span>*</span>
                    </label>

                    <input
                      id="nit"
                      name="nit"
                      type="text"
                      value={formulario.nit}
                      onChange={manejarCambioFormulario}
                      maxLength={20}
                      placeholder="Ej. 1234567-8 o CF"
                      disabled={guardando}
                    />
                  </div>

                  <div className="module-form-group">
                    <label htmlFor="telefono">Teléfono</label>

                    <input
                      id="telefono"
                      name="telefono"
                      type="text"
                      value={formulario.telefono}
                      onChange={manejarCambioFormulario}
                      maxLength={20}
                      placeholder="Ej. 5555-5555"
                      disabled={guardando}
                    />
                  </div>
                </div>

                <div className="module-form-group">
                  <label htmlFor="email">Correo electrónico</label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formulario.email}
                    onChange={manejarCambioFormulario}
                    maxLength={150}
                    placeholder="cliente@correo.com"
                    disabled={guardando}
                  />

                  <small>{formulario.email.length}/150 caracteres</small>
                </div>

                <div className="client-info-box">
                  <strong>Consumidor Final</strong>
                  <span>
                    Utilice <b>CF</b> cuando el cliente no requiera registrar un
                    NIT. A diferencia de un NIT normal, CF puede utilizarse en
                    varios clientes.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={cerrarModal}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={guardando}
                >
                  {guardando
                    ? "Guardando..."
                    : idEditando
                      ? "Guardar cambios"
                      : "Registrar cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clientes;