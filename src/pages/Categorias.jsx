import {
  useEffect,
  useState,
} from "react";

import {
  CirclePlus,
  Edit3,
  Power,
  RefreshCw,
  Search,
  Tags,
  X,
} from "lucide-react";

import Swal from "sweetalert2";

import {
  toast,
} from "react-toastify";

import categoriaService
  from "../services/categoriaService";

import "./categorias.css";


const formularioInicial = {
  nombre: "",
  descripcion: "",
};


function Categorias() {

  const [
    categorias,
    setCategorias,
  ] = useState([]);


  const [
    cargando,
    setCargando,
  ] = useState(true);


  const [
    buscar,
    setBuscar,
  ] = useState("");


  const [
    filtroEstado,
    setFiltroEstado,
  ] = useState("todos");


  const [
    mostrarModal,
    setMostrarModal,
  ] = useState(false);


  const [
    guardando,
    setGuardando,
  ] = useState(false);


  const [
    idEditando,
    setIdEditando,
  ] = useState(null);


  const [
    formulario,
    setFormulario,
  ] = useState(
    formularioInicial
  );

  const obtenerMensajeError = (
    error,
    mensajePredeterminado
  ) => {

    if (!error.response) {

      return (
        "No fue posible comunicarse " +
        "con el servidor."
      );
    }


    return (
      error.response?.data?.mensaje ??
      mensajePredeterminado
    );
  };

  const cargarCategorias =
    async (
      textoBuscar = buscar,
      estado = filtroEstado
    ) => {

      try {

        setCargando(true);


        const soloActivas =
          estado === "activas"
            ? true
            : null;


        let data =
          await categoriaService.obtener(
            textoBuscar,
            soloActivas
          );

        if (estado === "inactivas") {

          data =
            data.filter(
              (categoria) =>
                !categoria.activo
            );
        }


        setCategorias(data);

      } catch (error) {

        console.error(error);


        await Swal.fire({

          title:
            "Error",

          text:
            obtenerMensajeError(
              error,
              "No fue posible obtener las categorías."
            ),

          icon:
            "error",

          confirmButtonText:
            "Aceptar",
        });

      } finally {

        setCargando(false);
      }
    };

  useEffect(() => {

    cargarCategorias("", "todos");

  }, []);

  const manejarBusqueda =
    async (event) => {

      event.preventDefault();

      await cargarCategorias();
    };

  const manejarCambioFiltro =
    async (event) => {

      const nuevoEstado =
        event.target.value;


      setFiltroEstado(
        nuevoEstado
      );


      await cargarCategorias(
        buscar,
        nuevoEstado
      );
    };

  const limpiarFiltros =
    async () => {

      setBuscar("");

      setFiltroEstado(
        "todos"
      );


      await cargarCategorias(
        "",
        "todos"
      );
    };

  const abrirNuevaCategoria = () => {

    setIdEditando(null);

    setFormulario(
      formularioInicial
    );

    setMostrarModal(true);
  };

  const abrirEditarCategoria =
    async (id) => {

      try {

        const categoria =
          await categoriaService
            .obtenerPorId(id);


        setIdEditando(id);


        setFormulario({

          nombre:
            categoria.nombre ?? "",

          descripcion:
            categoria.descripcion ?? "",
        });


        setMostrarModal(true);

      } catch (error) {

        await Swal.fire({

          title:
            "Error",

          text:
            obtenerMensajeError(
              error,
              "No fue posible obtener la categoría."
            ),

          icon:
            "error",

          confirmButtonText:
            "Aceptar",
        });
      }
    };

  const cerrarModal = () => {

    if (guardando) {
      return;
    }


    setMostrarModal(false);

    setIdEditando(null);

    setFormulario(
      formularioInicial
    );
  };

  const manejarCambioFormulario =
    (event) => {

      const {
        name,
        value,
      } = event.target;


      setFormulario(
        (actual) => ({
          ...actual,
          [name]: value,
        })
      );
    };

  const guardarCategoria =
    async (event) => {

      event.preventDefault();


      const nombre =
        formulario.nombre.trim();


      const descripcion =
        formulario.descripcion.trim();


      if (!nombre) {

        await Swal.fire({

          title:
            "Datos incompletos",

          text:
            "Ingrese el nombre de la categoría.",

          icon:
            "warning",

          confirmButtonText:
            "Aceptar",
        });

        return;
      }


      if (nombre.length > 100) {

        await Swal.fire({

          title:
            "Nombre demasiado largo",

          text:
            "El nombre no puede superar los 100 caracteres.",

          icon:
            "warning",

          confirmButtonText:
            "Aceptar",
        });

        return;
      }


      if (
        descripcion.length > 250
      ) {

        await Swal.fire({

          title:
            "Descripción demasiado larga",

          text:
            "La descripción no puede superar los 250 caracteres.",

          icon:
            "warning",

          confirmButtonText:
            "Aceptar",
        });

        return;
      }


      const datos = {

        nombre,

        descripcion:
          descripcion || null,
      };


      try {

        setGuardando(true);


        if (idEditando) {

          const resultado =
            await categoriaService
              .modificar(
                idEditando,
                datos
              );


          toast.success(
            resultado.mensaje ??
            "Categoría actualizada correctamente."
          );

        } else {

          const resultado =
            await categoriaService
              .crear(datos);


          toast.success(
            resultado.mensaje ??
            "Categoría registrada correctamente."
          );
        }


        cerrarModal();


        await cargarCategorias();

      } catch (error) {

        await Swal.fire({

          title:
            idEditando
              ? "No se pudo actualizar"
              : "No se pudo registrar",

          text:
            obtenerMensajeError(
              error,
              "Ocurrió un error al guardar la categoría."
            ),

          icon:
            "error",

          confirmButtonText:
            "Aceptar",
        });

      } finally {

        setGuardando(false);
      }
    };

  const cambiarEstado =
    async (categoria) => {

      const nuevoEstado =
        !categoria.activo;


      const resultado =
        await Swal.fire({

          title:
            nuevoEstado
              ? "¿Activar categoría?"
              : "¿Desactivar categoría?",

          text:
            nuevoEstado
              ? `Se activará "${categoria.nombre}".`
              : `Se desactivará "${categoria.nombre}".`,

          icon:
            "question",

          showCancelButton:
            true,

          confirmButtonText:
            nuevoEstado
              ? "Sí, activar"
              : "Sí, desactivar",

          cancelButtonText:
            "Cancelar",

          reverseButtons:
            true,
        });


      if (!resultado.isConfirmed) {
        return;
      }


      try {

        const response =
          await categoriaService
            .cambiarEstado(
              categoria.idCategoria,
              nuevoEstado
            );


        toast.success(
          response.mensaje ??
          "Estado actualizado correctamente."
        );


        await cargarCategorias();

      } catch (error) {

        await Swal.fire({

          title:
            "No se pudo cambiar el estado",

          text:
            obtenerMensajeError(
              error,
              "Ocurrió un error al cambiar el estado."
            ),

          icon:
            "error",

          confirmButtonText:
            "Aceptar",
        });
      }
    };


  return (

    <div className="categories-page">

      <div className="module-header">

        <div>

          <p className="page-eyebrow">
            CATÁLOGOS
          </p>

          <h1>
            Categorías
          </h1>

          <p>
            Administración de las categorías
            utilizadas para clasificar los
            productos de la cafetería.
          </p>

        </div>


        <button
          type="button"
          className="primary-button"
          onClick={abrirNuevaCategoria}
        >

          <CirclePlus size={18} />

          Nueva categoría

        </button>

      </div>

      <section className="filters-card">

        <form
          className="categories-filters"
          onSubmit={manejarBusqueda}
        >

          <div className="category-search">

            <Search
              size={18}
            />

            <input
              type="text"
              value={buscar}
              onChange={(event) =>
                setBuscar(
                  event.target.value
                )
              }
              placeholder="Buscar por nombre..."
              maxLength={100}
            />

          </div>


          <select
            value={filtroEstado}
            onChange={
              manejarCambioFiltro
            }
          >

            <option value="todos">
              Todos los estados
            </option>

            <option value="activas">
              Activas
            </option>

            <option value="inactivas">
              Inactivas
            </option>

          </select>


          <button
            type="submit"
            className="secondary-button"
          >

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

            <div className="data-card-icon">
              <Tags size={19} />
            </div>

            <div>

              <strong>
                Listado de categorías
              </strong>

              <span>
                {categorias.length}
                {" "}
                registro
                {
                  categorias.length === 1
                    ? ""
                    : "s"
                }
              </span>

            </div>

          </div>

        </div>


        {cargando ? (

          <div className="module-loading">

            <div className="spinner"></div>

            <p>
              Cargando categorías...
            </p>

          </div>

        ) : categorias.length === 0 ? (

          <div className="empty-state">

            <Tags size={40} />

            <strong>
              No se encontraron categorías
            </strong>

            <span>
              Modifique los filtros o registre
              una nueva categoría.
            </span>

          </div>

        ) : (

          <div className="table-container">

            <table className="data-table">

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Nombre
                  </th>

                  <th>
                    Descripción
                  </th>

                  <th>
                    Estado
                  </th>

                  <th className="actions-column">
                    Acciones
                  </th>

                </tr>

              </thead>


              <tbody>

                {categorias.map(
                  (categoria) => (

                    <tr
                      key={
                        categoria.idCategoria
                      }
                    >

                      <td
                        className="id-column"
                      >
                        #
                        {
                          categoria.idCategoria
                        }
                      </td>


                      <td>

                        <strong className="category-name">
                          {
                            categoria.nombre
                          }
                        </strong>

                      </td>


                      <td>

                        <span className="description-cell">

                          {
                            categoria.descripcion ||
                            "Sin descripción"
                          }

                        </span>

                      </td>


                      <td>

                        <span
                          className={
                            categoria.activo
                              ? "status-badge active"
                              : "status-badge inactive"
                          }
                        >

                          {
                            categoria.activo
                              ? "Activa"
                              : "Inactiva"
                          }

                        </span>

                      </td>


                      <td>

                        <div className="table-actions">

                          <button
                            type="button"
                            className="table-action edit"
                            title="Editar categoría"
                            onClick={() =>
                              abrirEditarCategoria(
                                categoria.idCategoria
                              )
                            }
                          >

                            <Edit3 size={17} />

                          </button>


                          <button
                            type="button"
                            className={
                              categoria.activo
                                ? "table-action deactivate"
                                : "table-action activate"
                            }
                            title={
                              categoria.activo
                                ? "Desactivar categoría"
                                : "Activar categoría"
                            }
                            onClick={() =>
                              cambiarEstado(
                                categoria
                              )
                            }
                          >

                            <Power size={17} />

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {mostrarModal && (

        <div
          className="modal-backdrop"
          onMouseDown={
            cerrarModal
          }
        >

          <div
            className="category-modal"
            onMouseDown={
              (event) =>
                event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <p className="modal-eyebrow">
                  {
                    idEditando
                      ? "EDITAR REGISTRO"
                      : "NUEVO REGISTRO"
                  }
                </p>

                <h2>

                  {
                    idEditando
                      ? "Editar categoría"
                      : "Nueva categoría"
                  }

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


            <form
              onSubmit={
                guardarCategoria
              }
            >

              <div className="modal-body">

                <div className="module-form-group">

                  <label htmlFor="nombre">
                    Nombre
                    <span>*</span>
                  </label>

                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={
                      formulario.nombre
                    }
                    onChange={
                      manejarCambioFormulario
                    }
                    maxLength={100}
                    placeholder="Ej. Bebidas calientes"
                    autoFocus
                    disabled={guardando}
                  />

                  <small>
                    {
                      formulario.nombre.length
                    }
                    /100 caracteres
                  </small>

                </div>


                <div className="module-form-group">

                  <label htmlFor="descripcion">
                    Descripción
                  </label>

                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={
                      formulario.descripcion
                    }
                    onChange={
                      manejarCambioFormulario
                    }
                    maxLength={250}
                    rows={4}
                    placeholder="Descripción opcional de la categoría"
                    disabled={guardando}
                  />

                  <small>
                    {
                      formulario.descripcion.length
                    }
                    /250 caracteres
                  </small>

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

                  {
                    guardando
                      ? "Guardando..."
                      : idEditando
                        ? "Guardar cambios"
                        : "Registrar categoría"
                  }

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}


export default Categorias;