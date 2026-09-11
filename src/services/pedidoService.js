import api from "../api/api";

const pedidoService = {
  obtener: async ({
    fechaInicio = "",
    fechaFin = "",
    idEstadoPedido = "",
    idCliente = "",
  } = {}) => {
    const params = {};

    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;

    if (idEstadoPedido !== "") {
      params.idEstadoPedido = Number(idEstadoPedido);
    }

    if (idCliente !== "") {
      params.idCliente = Number(idCliente);
    }

    const response = await api.get(
      "/api/Pedidos",
      { params }
    );

    return response.data;
  },

  obtenerPorId: async (id) => {
    const response = await api.get(
      `/api/Pedidos/${id}`
    );

    return response.data;
  },

  crear: async (pedido) => {
    const response = await api.post(
      "/api/Pedidos",
      pedido
    );

    return response.data;
  },

  cambiarEstado: async (
    id,
    idEstadoPedido
  ) => {
    const response = await api.put(
      `/api/Pedidos/${id}/estado`,
      {
        idEstadoPedido,
      }
    );

    return response.data;
  },

  obtenerEstados: async () => {
    const response = await api.get(
      "/api/EstadosPedido"
    );

    return response.data;
  },
};

export default pedidoService;