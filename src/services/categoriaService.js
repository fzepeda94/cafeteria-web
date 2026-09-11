import api from "../api/api";

const categoriaService = {

  obtener: async (buscar = "", soloActivas = null) => {

    const params = {};

    if (buscar.trim()) {
      params.buscar = buscar.trim();
    }

    if (soloActivas === true) {
      params.soloActivas = true;
    }

    const response = await api.get(
      "/api/Categorias",
      {
        params,
      }
    );

    return response.data;
  },


  obtenerPorId: async (id) => {

    const response = await api.get(
      `/api/Categorias/${id}`
    );

    return response.data;
  },


  crear: async (categoria) => {

    const response = await api.post(
      "/api/Categorias",
      categoria
    );

    return response.data;
  },


  modificar: async (id, categoria) => {

    const response = await api.put(
      `/api/Categorias/${id}`,
      categoria
    );

    return response.data;
  },


  cambiarEstado: async (id, activo) => {

    const response = await api.patch(
      `/api/Categorias/${id}/estado`,
      {
        activo,
      }
    );

    return response.data;
  },

};

export default categoriaService;