import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import productoService from "../services/productoService";
import clienteService from "../services/clienteService";
import categoriaService from "../services/categoriaService";
import pedidoService from "../services/pedidoService";
import "./pedidos.css";

function NuevoPedido() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [idCliente, setIdCliente] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [buscarProducto, setBuscarProducto] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

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

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);

        const [clientesData, productosData, categoriasData] = await Promise.all([
          clienteService.obtener({ activo: "true" }),
          productoService.obtener({ disponible: "true", activo: "true" }),
          categoriaService.obtener("", true),
        ]);

        const categoriasActivas = new Set(
          categoriasData.map((categoria) => categoria.idCategoria)
        );

        const productosValidos = productosData.filter((producto) =>
          categoriasActivas.has(producto.idCategoria)
        );

        setClientes(clientesData);
        setProductos(productosValidos);
      } catch (error) {
        console.error(error);
        await Swal.fire({
          title: "Error",
          text: obtenerMensajeError(
            error,
            "No fue posible cargar la información para crear el pedido."
          ),
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const productosFiltrados = useMemo(() => {
    const texto = buscarProducto.trim().toLowerCase();
    if (!texto) return productos;

    return productos.filter(
      (producto) =>
        producto.nombre.toLowerCase().includes(texto) ||
        producto.codigo.toLowerCase().includes(texto) ||
        producto.categoria.toLowerCase().includes(texto)
    );
  }, [buscarProducto, productos]);

  const total = useMemo(
    () =>
      carrito.reduce(
        (acumulado, producto) =>
          acumulado + producto.precio * producto.cantidad,
        0
      ),
    [carrito]
  );

  const agregarProducto = (producto) => {
    setCarrito((actual) => {
      const existe = actual.find(
        (item) => item.idProducto === producto.idProducto
      );

      if (existe) {
        if (existe.cantidad >= 100) {
          toast.warning("La cantidad máxima por producto es 100.");
          return actual;
        }

        return actual.map((item) =>
          item.idProducto === producto.idProducto
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...actual, { ...producto, cantidad: 1 }];
    });
  };

  const incrementar = (idProducto) => {
    setCarrito((actual) =>
      actual.map((item) =>
        item.idProducto === idProducto
          ? { ...item, cantidad: Math.min(item.cantidad + 1, 100) }
          : item
      )
    );
  };

  const decrementar = (idProducto) => {
    setCarrito((actual) =>
      actual
        .map((item) =>
          item.idProducto === idProducto
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const eliminarProducto = (idProducto) => {
    setCarrito((actual) =>
      actual.filter((item) => item.idProducto !== idProducto)
    );
  };

  const registrarPedido = async () => {
    if (carrito.length === 0) {
      await Swal.fire({
        title: "Pedido vacío",
        text: "Agregue al menos un producto al pedido.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    if (observaciones.length > 500) {
      await Swal.fire({
        title: "Observaciones demasiado largas",
        text: "Las observaciones no pueden superar los 500 caracteres.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    const confirmacion = await Swal.fire({
      title: "¿Registrar pedido?",
      html: `Total estimado: <strong>${formatoMoneda.format(total)}</strong>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, registrar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!confirmacion.isConfirmed) return;

    const datos = {
      idCliente: idCliente ? Number(idCliente) : null,
      observaciones: observaciones.trim() || null,
      detalles: carrito.map((item) => ({
        idProducto: item.idProducto,
        cantidad: item.cantidad,
      })),
    };

    try {
      setGuardando(true);
      const resultado = await pedidoService.crear(datos);

      await Swal.fire({
        title: "Pedido registrado",
        html: `
          <strong>${resultado.numeroPedido}</strong>
          <br><br>
          Total:
          <strong>${formatoMoneda.format(resultado.total)}</strong>
        `,
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      navigate("/pedidos", { replace: true });
    } catch (error) {
      await Swal.fire({
        title: "No se pudo registrar",
        text: obtenerMensajeError(
          error,
          "Ocurrió un error al registrar el pedido."
        ),
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="module-loading">
        <div className="spinner"></div>
        <p>Preparando nuevo pedido...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="module-header">
        <div>
          <p className="page-eyebrow">OPERACIÓN</p>
          <h1>Nuevo pedido</h1>
          <p>
            Seleccione el cliente y los productos que formarán parte del pedido.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/pedidos")}
        >
          <ArrowLeft size={17} />
          Volver
        </button>
      </div>

      <div className="new-order-layout">
        <section className="order-products-panel">
          <div className="order-section-header">
            <div>
              <Package size={20} />
              <div>
                <strong>Productos disponibles</strong>
                <span>{productosFiltrados.length} productos</span>
              </div>
            </div>
          </div>

          <div className="order-product-search">
            <Search size={18} />
            <input
              type="text"
              value={buscarProducto}
              onChange={(event) => setBuscarProducto(event.target.value)}
              placeholder="Buscar producto, código o categoría..."
            />
          </div>

          <div className="order-product-grid">
            {productosFiltrados.length === 0 ? (
              <div className="empty-products">
                <Package size={35} />
                <strong>No hay productos</strong>
                <span>No se encontraron productos disponibles.</span>
              </div>
            ) : (
              productosFiltrados.map((producto) => (
                <button
                  type="button"
                  key={producto.idProducto}
                  className="order-product-card"
                  onClick={() => agregarProducto(producto)}
                >
                  <div>
                    <span className="product-code">{producto.codigo}</span>
                    <span className="order-product-category">
                      {producto.categoria}
                    </span>
                  </div>

                  <strong>{producto.nombre}</strong>

                  <span className="order-product-description">
                    {producto.descripcion || "Sin descripción"}
                  </span>

                  <div className="order-product-footer">
                    <strong>{formatoMoneda.format(producto.precio)}</strong>
                    <span>
                      <Plus size={16} />
                      Agregar
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <aside className="order-summary-panel">
          <div className="order-section-header">
            <div>
              <ShoppingCart size={20} />
              <div>
                <strong>Resumen del pedido</strong>
                <span>
                  {carrito.reduce(
                    (totalCantidad, item) => totalCantidad + item.cantidad,
                    0
                  )}{" "}
                  producto(s)
                </span>
              </div>
            </div>
          </div>

          <div className="order-client">
            <label>Cliente</label>

            <div className="order-client-select">
              <UserRound size={17} />
              <select
                value={idCliente}
                onChange={(event) => setIdCliente(event.target.value)}
              >
                <option value="">Consumidor final</option>
                {clientes.map((cliente) => (
                  <option key={cliente.idCliente} value={cliente.idCliente}>
                    {cliente.nombre} - {cliente.nit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="cart-items">
            {carrito.length === 0 ? (
              <div className="cart-empty">
                <ShoppingCart size={33} />
                <strong>Pedido vacío</strong>
                <span>Seleccione productos para comenzar.</span>
              </div>
            ) : (
              carrito.map((item) => (
                <div className="cart-item" key={item.idProducto}>
                  <div className="cart-item-main">
                    <div>
                      <strong>{item.nombre}</strong>
                      <span>{formatoMoneda.format(item.precio)} c/u</span>
                    </div>

                    <button
                      type="button"
                      className="cart-delete"
                      onClick={() => eliminarProducto(item.idProducto)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="cart-item-footer">
                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() => decrementar(item.idProducto)}
                      >
                        <Minus size={14} />
                      </button>

                      <span>{item.cantidad}</span>

                      <button
                        type="button"
                        onClick={() => incrementar(item.idProducto)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <strong>
                      {formatoMoneda.format(item.precio * item.cantidad)}
                    </strong>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="order-observations">
            <label htmlFor="observaciones">Observaciones</label>
            <textarea
              id="observaciones"
              value={observaciones}
              onChange={(event) => setObservaciones(event.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Indicaciones especiales del pedido..."
            />
            <small>{observaciones.length}/500 caracteres</small>
          </div>

          <div className="order-total">
            <span>Total estimado</span>
            <strong>{formatoMoneda.format(total)}</strong>
          </div>

          <button
            type="button"
            className="primary-button order-submit"
            onClick={registrarPedido}
            disabled={guardando || carrito.length === 0}
          >
            <Check size={18} />
            {guardando ? "Registrando..." : "Registrar pedido"}
          </button>
        </aside>
      </div>
    </div>
  );
}

export default NuevoPedido;
