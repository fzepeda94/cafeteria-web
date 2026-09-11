import { useEffect, useState } from "react";
import { Ban, CheckCircle2, ChevronRight, CirclePlus, ClipboardList, Clock3, Eye, RefreshCw, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import pedidoService from "../services/pedidoService";
import clienteService from "../services/clienteService";
import "./categorias.css";
import "./pedidos.css";
const transiciones = {
    PENDIENTE: ["EN_PREPARACION", "CANCELADO"],
    EN_PREPARACION: ["LISTO", "CANCELADO"],
    LISTO: ["ENTREGADO", "CANCELADO"],
    ENTREGADO: [],
    CANCELADO: [],
};
function Pedidos() {
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);
    const [estados, setEstados] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [idEstadoPedido, setIdEstadoPedido] = useState("");
    const [idCliente, setIdCliente] = useState("");
    const [pedidoDetalle, setPedidoDetalle] = useState(null);
    const [cargandoDetalle, setCargandoDetalle] = useState(false);
    const formatoMoneda = new Intl.NumberFormat("es-GT", {
        style: "currency",
        currency: "GTQ",
    });
    const obtenerMensajeError = (error, mensajePredeterminado) => {
        if (!error.response) {
            return "No fue posible comunicarse con el servidor.";
        }
        return (error.response?.data?.mensaje ??
            mensajePredeterminado);
    };
    const nombreEstado = (estado) => {
        const nombres = {
            PENDIENTE: "Pendiente",
            EN_PREPARACION: "En preparación",
            LISTO: "Listo",
            ENTREGADO: "Entregado",
            CANCELADO: "Cancelado",
        };
        return (nombres[estado] ??
            estado);
    };
    const claseEstado = (estado) => `order-status ${estado
        ?.toLowerCase()
        .replaceAll("_", "-")}`;
    const cargarPedidos = async (filtros = null) => {
        try {
            setCargando(true);
            const data = await pedidoService.obtener(filtros ?? {
                fechaInicio,
                fechaFin,
                idEstadoPedido,
                idCliente,
            });
            setPedidos(data);
        }
        catch (error) {
            await Swal.fire({
                title: "Error",
                text: obtenerMensajeError(error, "No fue posible obtener los pedidos."),
                icon: "error",
                confirmButtonText: "Aceptar",
            });
        }
        finally {
            setCargando(false);
        }
    };
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [estadosData, clientesData] = await Promise.all([
                    pedidoService.obtenerEstados(),
                    clienteService.obtener(),
                ]);
                setEstados(estadosData);
                setClientes(clientesData);
                await cargarPedidos({
                    fechaInicio: "",
                    fechaFin: "",
                    idEstadoPedido: "",
                    idCliente: "",
                });
            }
            catch (error) {
                console.error(error);
                await Swal.fire({
                    title: "Error",
                    text: "No fue posible cargar la información del módulo de pedidos.",
                    icon: "error",
                    confirmButtonText: "Aceptar",
                });
            }
        };
        cargarDatos();
    }, []);
    const buscarPedidos = async (event) => {
        event.preventDefault();
        await cargarPedidos();
    };
    const limpiarFiltros = async () => {
        setFechaInicio("");
        setFechaFin("");
        setIdEstadoPedido("");
        setIdCliente("");
        await cargarPedidos({
            fechaInicio: "",
            fechaFin: "",
            idEstadoPedido: "",
            idCliente: "",
        });
    };
    const abrirDetalle = async (idPedido) => {
        try {
            setCargandoDetalle(true);
            const data = await pedidoService.obtenerPorId(idPedido);
            setPedidoDetalle(data);
        }
        catch (error) {
            await Swal.fire({
                title: "Error",
                text: obtenerMensajeError(error, "No fue posible obtener el detalle del pedido."),
                icon: "error",
                confirmButtonText: "Aceptar",
            });
        }
        finally {
            setCargandoDetalle(false);
        }
    };
    const cerrarDetalle = () => {
        if (cargandoDetalle) {
            return;
        }
        setPedidoDetalle(null);
    };
    const obtenerEstado = (nombre) => estados.find((estado) => estado.nombre === nombre);
    const cambiarEstado = async (nuevoEstadoNombre) => {
        if (!pedidoDetalle) {
            return;
        }
        const nuevoEstado = obtenerEstado(nuevoEstadoNombre);
        if (!nuevoEstado) {
            await Swal.fire({
                title: "Estado no encontrado",
                text: "No se encontró el estado solicitado en el catálogo.",
                icon: "error",
                confirmButtonText: "Aceptar",
            });
            return;
        }
        const esCancelacion = nuevoEstadoNombre === "CANCELADO";
        const confirmacion = await Swal.fire({
            title: esCancelacion
                ? "¿Cancelar pedido?"
                : `¿Cambiar a ${nombreEstado(nuevoEstadoNombre)}?`,
            text: esCancelacion
                ? `El pedido ${pedidoDetalle.numeroPedido} quedará cancelado.`
                : `Se actualizará el estado del pedido ${pedidoDetalle.numeroPedido}.`,
            icon: esCancelacion
                ? "warning"
                : "question",
            showCancelButton: true,
            confirmButtonText: esCancelacion
                ? "Sí, cancelar pedido"
                : "Sí, cambiar estado",
            cancelButtonText: "No",
            reverseButtons: true,
        });
        if (!confirmacion.isConfirmed) {
            return;
        }
        try {
            const resultado = await pedidoService.cambiarEstado(pedidoDetalle.idPedido, nuevoEstado.idEstadoPedido);
            toast.success(resultado.mensaje ?? "Estado actualizado correctamente.");
            const actualizado = await pedidoService.obtenerPorId(pedidoDetalle.idPedido);
            setPedidoDetalle(actualizado);
            await cargarPedidos();
        }
        catch (error) {
            await Swal.fire({
                title: "No se pudo cambiar el estado",
                text: obtenerMensajeError(error, "Ocurrió un error al cambiar el estado."),
                icon: "error",
                confirmButtonText: "Aceptar",
            });
        }
    };
    const siguientesEstados = pedidoDetalle
        ? (transiciones[pedidoDetalle.estado.nombre] ?? [])
        : [];
    return (<div className="orders-page">
      <div className="module-header">
        <div>
          <p className="page-eyebrow">
            OPERACIÓN
          </p>
          <h1>
            Pedidos
          </h1>
          <p>
            Consulta, registro y seguimiento
            de los pedidos de la cafetería.
          </p>
        </div>
        <button type="button" className="primary-button" onClick={() => navigate("/pedidos/nuevo")}>
          <CirclePlus size={18}/>
          Nuevo pedido
        </button>
      </div>
      {/* FILTROS */}
      <section className="filters-card">
        <form className="order-filters" onSubmit={buscarPedidos}>
          <div className="date-field">
            <label>
              Desde
            </label>
            <input type="date" value={fechaInicio} onChange={(event) => setFechaInicio(event.target.value)}/>
          </div>
          <div className="date-field">
            <label>
              Hasta
            </label>
            <input type="date" value={fechaFin} onChange={(event) => setFechaFin(event.target.value)}/>
          </div>
          <select value={idEstadoPedido} onChange={(event) => setIdEstadoPedido(event.target.value)}>
            <option value="">
              Todos los estados
            </option>
            {estados.map((estado) => (<option key={estado.idEstadoPedido} value={estado.idEstadoPedido}>
                    {nombreEstado(estado.nombre)}
                  </option>))}
          </select>
          <select value={idCliente} onChange={(event) => setIdCliente(event.target.value)}>
            <option value="">
              Todos los clientes
            </option>
            {clientes.map((cliente) => (<option key={cliente.idCliente} value={cliente.idCliente}>
                    {cliente.nombre}
                  </option>))}
          </select>
          <button type="submit" className="secondary-button">
            <Search size={17}/>
            Buscar
          </button>
          <button type="button" className="icon-text-button" onClick={limpiarFiltros}>
            <RefreshCw size={17}/>
            Limpiar
          </button>
        </form>
      </section>
      {/* TABLA */}
      <section className="data-card">
        <div className="data-card-header">
          <div>
            <div className="data-card-icon order-data-icon">
              <ClipboardList size={19}/>
            </div>
            <div>
              <strong>
                Listado de pedidos
              </strong>
              <span>
                {pedidos.length}
                {" "}
                registro
                {pedidos.length === 1
            ? ""
            : "s"}
              </span>
            </div>
          </div>
        </div>
        {cargando ? (<div className="module-loading">
            <div className="spinner"></div>
            <p>
              Cargando pedidos...
            </p>
          </div>) : pedidos.length === 0 ? (<div className="empty-state">
            <ClipboardList size={40}/>
            <strong>
              No se encontraron pedidos
            </strong>
            <span>
              Modifique los filtros o registre
              un nuevo pedido.
            </span>
          </div>) : (<div className="table-container">
            <table className="data-table orders-table">
              <thead>
                <tr>
                  <th>
                    Pedido
                  </th>
                  <th>
                    Fecha
                  </th>
                  <th>
                    Cliente
                  </th>
                  <th>
                    Productos
                  </th>
                  <th>
                    Total
                  </th>
                  <th>
                    Estado
                  </th>
                  <th>
                    Atendido por
                  </th>
                  <th>
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (<tr key={pedido.idPedido}>
                        <td>
                          <strong className="order-number">
                            {pedido.numeroPedido}
                          </strong>
                        </td>
                        <td>
                          <span className="order-date">
                            {new Date(pedido.fechaPedido)
                    .toLocaleString("es-GT", {
                    dateStyle: "short",
                    timeStyle: "short",
                })}
                          </span>
                        </td>
                        <td>
                          {pedido.cliente}
                        </td>
                        <td>
                          {pedido.cantidadProductos}
                        </td>
                        <td>
                          <strong className="product-price">
                            {formatoMoneda.format(pedido.total)}
                          </strong>
                        </td>
                        <td>
                          <span className={claseEstado(pedido.estado)}>
                            {nombreEstado(pedido.estado)}
                          </span>
                        </td>
                        <td>
                          {pedido.usuario}
                        </td>
                        <td>
                          <button type="button" className="table-action view" title="Ver pedido" onClick={() => abrirDetalle(pedido.idPedido)}>
                            <Eye size={17}/>
                          </button>
                        </td>
                      </tr>))}
              </tbody>
            </table>
          </div>)}
      </section>
      {/* DETALLE */}
      {pedidoDetalle && (<div className="modal-backdrop" onMouseDown={cerrarDetalle}>
            <div className="order-detail-modal" onMouseDown={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <p className="modal-eyebrow">
                    DETALLE DEL PEDIDO
                  </p>
                  <h2>
                    {pedidoDetalle.numeroPedido}
                  </h2>
                </div>
                <button type="button" className="modal-close" onClick={cerrarDetalle}>
                  <X size={20}/>
                </button>
              </div>
              <div className="order-detail-body">
                <div className="order-detail-summary">
                  <div>
                    <span>
                      Cliente
                    </span>
                    <strong>
                      {pedidoDetalle.cliente
                ?.nombre ??
                "Consumidor final"}
                    </strong>
                    {pedidoDetalle.cliente
                ?.nit && (<small>
                          NIT:
                          {" "}
                          {pedidoDetalle
                    .cliente.nit}
                        </small>)}
                  </div>
                  <div>
                    <span>
                      Estado
                    </span>
                    <strong>
                      <span className={claseEstado(pedidoDetalle
                .estado.nombre)}>
                        {nombreEstado(pedidoDetalle
                .estado.nombre)}
                      </span>
                    </strong>
                  </div>
                  <div>
                    <span>
                      Fecha
                    </span>
                    <strong>
                      {new Date(pedidoDetalle
                .fechaPedido)
                .toLocaleString("es-GT")}
                    </strong>
                  </div>
                  <div>
                    <span>
                      Usuario
                    </span>
                    <strong>
                      {pedidoDetalle.usuario}
                    </strong>
                  </div>
                </div>
                <div className="order-detail-table">
                  <table>
                    <thead>
                      <tr>
                        <th>
                          Producto
                        </th>
                        <th>
                          Cant.
                        </th>
                        <th>
                          Precio
                        </th>
                        <th>
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidoDetalle
                .detalles
                .map((detalle) => (<tr key={detalle
                    .idPedidoDetalle}>
                                <td>
                                  <strong>
                                    {detalle.producto}
                                  </strong>
                                  <span>
                                    {detalle.codigo}
                                    {" · "}
                                    {detalle.categoria}
                                  </span>
                                </td>
                                <td>
                                  {detalle.cantidad}
                                </td>
                                <td>
                                  {formatoMoneda.format(detalle.precioUnitario)}
                                </td>
                                <td>
                                  <strong>
                                    {formatoMoneda.format(detalle.subtotal)}
                                  </strong>
                                </td>
                              </tr>))}
                    </tbody>
                  </table>
                </div>
                {pedidoDetalle
                .observaciones && (<div className="order-notes">
                      <span>
                        Observaciones
                      </span>
                      <p>
                        {pedidoDetalle
                    .observaciones}
                      </p>
                    </div>)}
                <div className="order-detail-total">
                  <span>
                    Total del pedido
                  </span>
                  <strong>
                    {formatoMoneda.format(pedidoDetalle.total)}
                  </strong>
                </div>
                {siguientesEstados
                .length > 0 && (<div className="order-state-actions">
                      <span>
                        Cambiar estado
                      </span>
                      <div>
                        {siguientesEstados
                    .filter((estado) => estado !==
                    "CANCELADO")
                    .map((estado) => (<button type="button" key={estado} className="primary-button" onClick={() => cambiarEstado(estado)}>
                                  <ChevronRight size={17}/>
                                  {nombreEstado(estado)}
                                </button>))}
                        {siguientesEstados
                    .includes("CANCELADO") && (<button type="button" className="danger-button" onClick={() => cambiarEstado("CANCELADO")}>
                              <Ban size={17}/>
                              Cancelar pedido
                            </button>)}
                      </div>
                    </div>)}
                {pedidoDetalle
                .estado.nombre ===
                "ENTREGADO" && (<div className="final-order-message success">
                      <CheckCircle2 size={19}/>
                      Pedido entregado
                    </div>)}
                {pedidoDetalle
                .estado.nombre ===
                "CANCELADO" && (<div className="final-order-message cancelled">
                      <Ban size={19}/>
                      Pedido cancelado
                    </div>)}
              </div>
            </div>
          </div>)}
      {cargandoDetalle && (<div className="modal-backdrop">
            <div className="detail-loading">
              <div className="spinner"></div>
              <span>
                Cargando detalle...
              </span>
            </div>
          </div>)}
    </div>);
}
export default Pedidos;
