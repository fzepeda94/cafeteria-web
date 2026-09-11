import api from "../api/api";

const reporteService = {
  ventas: async (fechaInicio, fechaFin) => {
    const response = await api.get("/api/Reportes/ventas", {
      params: { fechaInicio, fechaFin },
    });
    return response.data;
  },

  productosMasVendidos: async (fechaInicio, fechaFin) => {
    const response = await api.get("/api/Reportes/productos-mas-vendidos", {
      params: { fechaInicio, fechaFin },
    });
    return response.data;
  },

  ventasPorDia: async (fechaInicio, fechaFin) => {
    const response = await api.get("/api/Reportes/ventas-por-dia", {
      params: { fechaInicio, fechaFin },
    });
    return response.data;
  },
};

export default reporteService;