import api from "../api/api";

const clienteService = {
  obtener: async ({ buscar = "", activo = "" } = {}) => {
    const params = {};

    if (buscar.trim()) params.buscar = buscar.trim();
    if (activo !== "") params.activo = activo === true || activo === "true";

    const response = await api.get("/api/Clientes", { params });
    return response.data;
  },

  obtenerPorId: async (id) => {
    const response = await api.get(`/api/Clientes/${id}`);
    return response.data;
  },

  crear: async (cliente) => {
    const response = await api.post("/api/Clientes", cliente);
    return response.data;
  },

  modificar: async (id, cliente) => {
    const response = await api.put(`/api/Clientes/${id}`, cliente);
    return response.data;
  },

  cambiarEstado: async (id, activo) => {
    const response = await api.patch(`/api/Clientes/${id}/estado`, { activo });
    return response.data;
  },
};

export default clienteService;