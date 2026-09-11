import { useEffect, useState } from "react";
import {
  CirclePlus, Edit3, Package, PackageCheck, PackageX, Power, RefreshCw, Search, X,
} from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import productoService from "../services/productoService";
import categoriaService from "../services/categoriaService";
import { useAuth } from "../context/AuthContext";
import "./categorias.css";
import "./productos.css";

const formularioInicial = {
  codigo: "",
  nombre: "",
  descripcion: "",
  precio: "",
  idCategoria: "",
  disponible: true,
};

function Productos() {
  const { tieneRol } = useAuth();
  const esAdministrador = tieneRol("ADMINISTRADOR");

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [buscar, setBuscar] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroDisponible, setFiltroDisponible] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioInicial);

  const formatoMoneda = new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  });

  const obtenerMensajeError = (error, mensajePredeterminado) => {
    if (!error.response) return "No fue posible comunicarse con el servidor.";
    if (error.response?.data?.mensaje) return error.response.data.mensaje;

    if (error.response?.data?.errors) {
      const errores = Object.values(error.response.data.errors).flat().join(" ");
      if (errores) return errores;
    }

    return mensajePredeterminado;
  };

  const cargarCategorias = async () => {
    try {
      const data = await categoriaService.obtener();
      setCategorias(data);
    } catch (error) {
      console.error(error);
      await Swal.fire({
        title: "Error",
        text: obtenerMensajeError(error, "No fue posible obtener las categorías."),
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };

  const cargarProductos = async (filtros = null) => {
    try {
      setCargando(true);

      const valores = filtros ?? {
        buscar,
        idCategoria: filtroCategoria,
        disponible: filtroDisponible,
        activo: filtroActivo,
      };

      const data = await productoService.obtener(valores);
      setProductos(data);
    } catch (error) {
      console.error(error);
      await Swal.fire({
        title: "Error",
        text: obtenerMensajeError(error, "No fue posible obtener los productos."),
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      await cargarCategorias();
      await cargarProductos({
        buscar: "",
        idCategoria: "",
        disponible: "",
        activo: "",
      });
    };

    cargarDatos();
  }, []);

  const manejarBusqueda = async (event) => {
    event.preventDefault();
    await cargarProductos();
  };

  const limpiarFiltros = async () => {
    setBuscar("");
    setFiltroCategoria("");
    setFiltroDisponible("");
    setFiltroActivo("");
    await cargarProductos({ buscar: "", idCategoria: "", disponible: "", activo: "" });
  };

  const abrirNuevoProducto = () => {
    setIdEditando(null);
    setFormulario(formularioInicial);
    setMostrarModal(true);
  };

  const abrirEditarProducto = async (id) => {
    try {
      const producto = await productoService.obtenerPorId(id);

      setIdEditando(id);
      setFormulario({
        codigo: producto.codigo ?? "",
        nombre: producto.nombre ?? "",
        descripcion: producto.descripcion ?? "",
        precio: producto.precio ?? "",
        idCategoria: String(producto.idCategoria ?? ""),
        disponible: producto.disponible ?? true,
      });
      setMostrarModal(true);
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: obtenerMensajeError(error, "No fue posible obtener el producto."),
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
    const { name, value, type, checked } = event.target;
    setFormulario((actual) => ({
      ...actual,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const guardarProducto = async (event) => {
    event.preventDefault();

    const codigo = formulario.codigo.trim().toUpperCase();
    const nombre = formulario.nombre.trim();
    const descripcion = formulario.descripcion.trim();
    const precio = Number(formulario.precio);
    const idCategoria = Number(formulario.idCategoria);

    if (!codigo) {
      await Swal.fire({
        title: "Datos incompletos",
        text: "Ingrese el código del producto.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    if (codigo.length > 20) {
      await Swal.fire({
        title: "Código inválido",
        text: "El código no puede superar los 20 caracteres.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    if (!nombre) {
      await Swal.fire({
        title: "Datos incompletos",
        text: "Ingrese el nombre del producto.",
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

    if (descripcion.length > 300) {
      await Swal.fire({
        title: "Descripción inválida",
        text: "La descripción no puede superar los 300 caracteres.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    if (Number.isNaN(precio) || precio < 0.01) {
      await Swal.fire({
        title: "Precio inválido",
        text: "Ingrese un precio mayor o igual a Q0.01.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    if (!idCategoria || idCategoria < 1) {
      await Swal.fire({
        title: "Categoría requerida",
        text: "Seleccione una categoría.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    const datos = {
      codigo,
      nombre,
      descripcion: descripcion || null,
      precio,
      idCategoria,
      disponible: formulario.disponible,
    };

    try {
      setGuardando(true);

      if (idEditando) {
        const resultado = await productoService.modificar(idEditando, datos);
        toast.success(resultado.mensaje ?? "Producto actualizado correctamente.");
      } else {
        const resultado = await productoService.crear(datos);
        toast.success(resultado.mensaje ?? "Producto registrado correctamente.");
      }

      setMostrarModal(false);
      setIdEditando(null);
      setFormulario(formularioInicial);
      await cargarProductos();
    } catch (error) {
      await Swal.fire({
        title: idEditando ? "No se pudo actualizar" : "No se pudo registrar",
        text: obtenerMensajeError(error, "Ocurrió un error al guardar el producto."),
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setGuardando(false);
    }
  };

  const cambiarDisponibilidad = async (producto) => {
    if (!producto.activo) {
      await Swal.fire({
        title: "Producto inactivo",
        text: "Debe activar el producto antes de cambiar su disponibilidad.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    const nuevaDisponibilidad = !producto.disponible;
    const resultado = await Swal.fire({
      title: nuevaDisponibilidad ? "¿Marcar como disponible?" : "¿Marcar como no disponible?",
      text: nuevaDisponibilidad
        ? `"${producto.nombre}" podrá utilizarse en nuevos pedidos.`
        : `"${producto.nombre}" dejará de estar disponible para nuevos pedidos.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: nuevaDisponibilidad ? "Sí, disponible" : "Sí, no disponible",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!resultado.isConfirmed) return;

    try {
      const response = await productoService.cambiarDisponibilidad(
        producto.idProducto,
        nuevaDisponibilidad
      );
      toast.success(response.mensaje ?? "Disponibilidad actualizada.");
      await cargarProductos();
    } catch (error) {
      await Swal.fire({
        title: "No se pudo actualizar",
        text: obtenerMensajeError(error, "No fue posible cambiar la disponibilidad."),
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };

  const cambiarEstado = async (producto) => {
    const nuevoEstado = !producto.activo;
    const resultado = await Swal.fire({
      title: nuevoEstado ? "¿Activar producto?" : "¿Desactivar producto?",
      text: nuevoEstado
        ? `Se activará "${producto.nombre}".`
        : `Se desactivará "${producto.nombre}" y dejará de estar disponible.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: nuevoEstado ? "Sí, activar" : "Sí, desactivar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!resultado.isConfirmed) return;

    try {
      const response = await productoService.cambiarEstado(producto.idProducto, nuevoEstado);
      toast.success(response.mensaje ?? "Estado actualizado correctamente.");
      await cargarProductos();
    } catch (error) {
      await Swal.fire({
        title: "No se pudo cambiar el estado",
        text: obtenerMensajeError(error, "Ocurrió un error al cambiar el estado."),
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };

  return (
    <div className="products-page">
      <div className="module-header">
        <div>
          <p className="page-eyebrow">CATÁLOGOS</p>
          <h1>Productos</h1>
          <p>
            Administración de los productos, precios, categorías y disponibilidad de la
            cafetería.
          </p>
        </div>

        {esAdministrador && (
          <button type="button" className="primary-button" onClick={abrirNuevoProducto}>
            <CirclePlus size={18} />
            Nuevo producto
          </button>
        )}
      </div>

      <section className="filters-card">
        <form className="product-filters" onSubmit={manejarBusqueda}>
          <div className="category-search product-search">
            <Search size={18} />
            <input
              type="text"
              value={buscar}
              onChange={(event) => setBuscar(event.target.value)}
              placeholder="Código o nombre..."
            />
          </div>

          <select
            value={filtroCategoria}
            onChange={(event) => setFiltroCategoria(event.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.idCategoria} value={categoria.idCategoria}>
                {categoria.nombre}{!categoria.activo ? " (Inactiva)" : ""}
              </option>
            ))}
          </select>

          <select
            value={filtroDisponible}
            onChange={(event) => setFiltroDisponible(event.target.value)}
          >
            <option value="">Toda disponibilidad</option>
            <option value="true">Disponibles</option>
            <option value="false">No disponibles</option>
          </select>

          <select value={filtroActivo} onChange={(event) => setFiltroActivo(event.target.value)}>
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>

          <button type="submit" className="secondary-button">
            <Search size={17} />
            Buscar
          </button>

          <button type="button" className="icon-text-button" onClick={limpiarFiltros}>
            <RefreshCw size={17} />
            Limpiar
          </button>
        </form>
      </section>

      <section className="data-card">
        <div className="data-card-header">
          <div>
            <div className="data-card-icon product-data-icon">
              <Package size={19} />
            </div>

            <div>
              <strong>Listado de productos</strong>
              <span>
                {productos.length} registro{productos.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>

        {cargando ? (
          <div className="module-loading">
            <div className="spinner"></div>
            <p>Cargando productos...</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="empty-state">
            <Package size={40} />
            <strong>No se encontraron productos</strong>
            <span>Modifique los filtros o registre un nuevo producto.</span>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table product-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Disponibilidad</th>
                  <th>Estado</th>
                  <th className="product-actions-column">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.idProducto}>
                    <td>
                      <span className="product-code">{producto.codigo}</span>
                    </td>

                    <td>
                      <div className="product-info-cell">
                        <strong>{producto.nombre}</strong>
                        <span>{producto.descripcion || "Sin descripción"}</span>
                      </div>
                    </td>

                    <td>
                      <span className="category-chip">{producto.categoria}</span>
                    </td>

                    <td>
                      <strong className="product-price">
                        {formatoMoneda.format(producto.precio)}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={
                          producto.disponible
                            ? "availability-badge available"
                            : "availability-badge unavailable"
                        }
                      >
                        {producto.disponible ? "Disponible" : "No disponible"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          producto.activo ? "status-badge active" : "status-badge inactive"
                        }
                      >
                        {producto.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className={
                            producto.disponible
                              ? "table-action availability-off"
                              : "table-action availability-on"
                          }
                          title={
                            producto.disponible
                              ? "Marcar como no disponible"
                              : "Marcar como disponible"
                          }
                          onClick={() => cambiarDisponibilidad(producto)}
                        >
                          {producto.disponible ? (
                            <PackageX size={17} />
                          ) : (
                            <PackageCheck size={17} />
                          )}
                        </button>

                        {esAdministrador && (
                          <>
                            <button
                              type="button"
                              className="table-action edit"
                              title="Editar producto"
                              onClick={() => abrirEditarProducto(producto.idProducto)}
                            >
                              <Edit3 size={17} />
                            </button>

                            <button
                              type="button"
                              className={
                                producto.activo
                                  ? "table-action deactivate"
                                  : "table-action activate"
                              }
                              title={producto.activo ? "Desactivar producto" : "Activar producto"}
                              onClick={() => cambiarEstado(producto)}
                            >
                              <Power size={17} />
                            </button>
                          </>
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
          <div className="product-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">
                  {idEditando ? "EDITAR REGISTRO" : "NUEVO REGISTRO"}
                </p>
                <h2>{idEditando ? "Editar producto" : "Nuevo producto"}</h2>
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

            <form onSubmit={guardarProducto}>
              <div className="modal-body">
                <div className="product-form-grid">
                  <div className="module-form-group">
                    <label htmlFor="codigo">
                      Código<span>*</span>
                    </label>
                    <input
                      id="codigo"
                      name="codigo"
                      type="text"
                      value={formulario.codigo}
                      onChange={manejarCambioFormulario}
                      maxLength={20}
                      placeholder="Ej. CAF001"
                      autoFocus
                      disabled={guardando}
                    />
                  </div>

                  <div className="module-form-group">
                    <label htmlFor="precio">
                      Precio<span>*</span>
                    </label>
                    <div className="price-input">
                      <span>Q</span>
                      <input
                        id="precio"
                        name="precio"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={formulario.precio}
                        onChange={manejarCambioFormulario}
                        placeholder="0.00"
                        disabled={guardando}
                      />
                    </div>
                  </div>
                </div>

                <div className="module-form-group">
                  <label htmlFor="nombre">
                    Nombre<span>*</span>
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={formulario.nombre}
                    onChange={manejarCambioFormulario}
                    maxLength={150}
                    placeholder="Ej. Café americano"
                    disabled={guardando}
                  />
                </div>

                <div className="module-form-group">
                  <label htmlFor="idCategoria">
                    Categoría<span>*</span>
                  </label>
                  <select
                    id="idCategoria"
                    name="idCategoria"
                    value={formulario.idCategoria}
                    onChange={manejarCambioFormulario}
                    disabled={guardando}
                  >
                    <option value="">Seleccione una categoría</option>
                    {categorias.map((categoria) => (
                      <option
                        key={categoria.idCategoria}
                        value={categoria.idCategoria}
                        disabled={!categoria.activo}
                      >
                        {categoria.nombre}{!categoria.activo ? " (Inactiva)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="module-form-group">
                  <label htmlFor="descripcion">Descripción</label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formulario.descripcion}
                    onChange={manejarCambioFormulario}
                    maxLength={300}
                    rows={4}
                    placeholder="Descripción opcional del producto"
                    disabled={guardando}
                  />
                  <small>{formulario.descripcion.length}/300 caracteres</small>
                </div>

                <label className="availability-switch">
                  <input
                    type="checkbox"
                    name="disponible"
                    checked={formulario.disponible}
                    onChange={manejarCambioFormulario}
                    disabled={guardando}
                  />
                  <span className="switch-control"></span>
                  <div>
                    <strong>Producto disponible</strong>
                    <small>Permite utilizar el producto en nuevos pedidos.</small>
                  </div>
                </label>
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

                <button type="submit" className="primary-button" disabled={guardando}>
                  {guardando
                    ? "Guardando..."
                    : idEditando
                      ? "Guardar cambios"
                      : "Registrar producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Productos;
