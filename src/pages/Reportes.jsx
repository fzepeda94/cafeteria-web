import { useEffect, useState } from "react";
import { BarChart3, CalendarDays, CircleDollarSign, Package, ReceiptText, Search } from "lucide-react";
import Swal from "sweetalert2";

import reporteService from "../services/reporteService";

import "./categorias.css";
import "./reportes.css";

function Reportes() {
  const hoy = new Date();
  const hace30Dias = new Date();
  hace30Dias.setDate(hoy.getDate() - 30);

  const fechaTexto = (fecha) => {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
  };

  const [fechaInicio, setFechaInicio] = useState(fechaTexto(hace30Dias));
  const [fechaFin, setFechaFin] = useState(fechaTexto(hoy));
  const [cargando, setCargando] = useState(false);
  const [ventas, setVentas] = useState(null);
  const [productos, setProductos] = useState([]);
  const [ventasPorDia, setVentasPorDia] = useState([]);

  const moneda = new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  });

  const fechaGT = (fecha) =>
    new Date(fecha).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  const generarReportes = async () => {
    if (!fechaInicio || !fechaFin) {
      await Swal.fire("Fechas requeridas", "Seleccione fecha inicial y final.", "warning");
      return;
    }

    if (fechaFin < fechaInicio) {
      await Swal.fire("Rango inválido", "La fecha final no puede ser menor que la fecha inicial.", "warning");
      return;
    }

    try {
      setCargando(true);

      const [ventasData, productosData, ventasDiaData] = await Promise.all([
        reporteService.ventas(fechaInicio, fechaFin),
        reporteService.productosMasVendidos(fechaInicio, fechaFin),
        reporteService.ventasPorDia(fechaInicio, fechaFin),
      ]);

      setVentas(ventasData);
      setProductos(productosData);
      setVentasPorDia(ventasDiaData);
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: error.response?.data?.mensaje ?? "No fue posible generar los reportes.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    generarReportes();
  }, []);

  return (
    <div className="reports-page">
      <div className="module-header">
        <div>
          <p className="page-eyebrow">ADMINISTRACIÓN</p>
          <h1>Reportes</h1>
          <p>Consulta de ventas y comportamiento de productos por rango de fechas.</p>
        </div>
      </div>

      <section className="report-filter-card">
        <div className="report-date-field">
          <label>Fecha inicial</label>
          <div>
            <CalendarDays size={16} />
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </div>
        </div>

        <div className="report-date-field">
          <label>Fecha final</label>
          <div>
            <CalendarDays size={16} />
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </div>
        </div>

        <button type="button" className="primary-button" onClick={generarReportes} disabled={cargando}>
          <Search size={17} />
          {cargando ? "Generando..." : "Generar reportes"}
        </button>
      </section>

      {cargando ? (
        <div className="module-loading">
          <div className="spinner"></div>
          <p>Generando reportes...</p>
        </div>
      ) : (
        <>
          <div className="report-summary-grid">
            <article className="report-summary-card">
              <div className="report-summary-icon"><ReceiptText size={22} /></div>
              <span>Pedidos entregados</span>
              <strong>{ventas?.cantidadPedidos ?? 0}</strong>
            </article>

            <article className="report-summary-card">
              <div className="report-summary-icon"><CircleDollarSign size={22} /></div>
              <span>Total vendido</span>
              <strong>{moneda.format(ventas?.totalVentas ?? 0)}</strong>
            </article>

            <article className="report-summary-card">
              <div className="report-summary-icon"><Package size={22} /></div>
              <span>Productos vendidos</span>
              <strong>{productos.reduce((total, item) => total + item.cantidadVendida, 0)}</strong>
            </article>

            <article className="report-summary-card">
              <div className="report-summary-icon"><BarChart3 size={22} /></div>
              <span>Días con ventas</span>
              <strong>{ventasPorDia.length}</strong>
            </article>
          </div>

          <section className="report-section">
            <div className="report-section-header">
              <div>
                <ReceiptText size={19} />
                <div>
                  <strong>Detalle de ventas</strong>
                  <span>Pedidos entregados durante el período</span>
                </div>
              </div>
            </div>

            {ventas?.ventas?.length ? (
              <div className="table-container">
                <table className="data-table report-table">
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Usuario</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.ventas.map((venta) => (
                      <tr key={venta.idPedido}>
                        <td><strong>{venta.numeroPedido}</strong></td>
                        <td>{new Date(venta.fechaPedido).toLocaleString("es-GT")}</td>
                        <td>{venta.cliente}</td>
                        <td>{venta.usuario}</td>
                        <td><strong>{moneda.format(venta.total)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="report-empty">No hay ventas entregadas en este período.</div>
            )}
          </section>

          <div className="report-columns">
            <section className="report-section">
              <div className="report-section-header">
                <div>
                  <Package size={19} />
                  <div>
                    <strong>Productos más vendidos</strong>
                    <span>Ordenados por cantidad vendida</span>
                  </div>
                </div>
              </div>

              {productos.length ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map((producto, index) => (
                        <tr key={producto.idProducto}>
                          <td>
                            <div className="report-product">
                              <span className="ranking">#{index + 1}</span>
                              <div>
                                <strong>{producto.producto}</strong>
                                <small>{producto.codigo}</small>
                              </div>
                            </div>
                          </td>
                          <td>{producto.cantidadVendida}</td>
                          <td><strong>{moneda.format(producto.totalVendido)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="report-empty">No existen productos vendidos.</div>
              )}
            </section>

            <section className="report-section">
              <div className="report-section-header">
                <div>
                  <BarChart3 size={19} />
                  <div>
                    <strong>Ventas por día</strong>
                    <span>Resumen diario del período</span>
                  </div>
                </div>
              </div>

              {ventasPorDia.length ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Pedidos</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventasPorDia.map((dia) => (
                        <tr key={dia.fecha}>
                          <td>{fechaGT(dia.fecha)}</td>
                          <td>{dia.cantidadPedidos}</td>
                          <td><strong>{moneda.format(dia.totalVentas)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="report-empty">No hay ventas diarias para mostrar.</div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default Reportes;