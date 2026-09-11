import api from "../api/api";


const productoService = {

  obtener: async ({
    buscar = "",
    idCategoria = "",
    disponible = "",
    activo = "",
  } = {}) => {

    const params = {};


    if (buscar.trim()) {
      params.buscar =
        buscar.trim();
    }


    if (idCategoria !== "") {
      params.idCategoria =
        Number(idCategoria);
    }


    if (disponible !== "") {
      params.disponible =
        disponible;
    }


    if (activo !== "") {
      params.activo =
        activo;
    }


    const response =
      await api.get(
        "/api/Productos",
        {
          params,
        }
      );


    return response.data;
  },


  obtenerPorId: async (id) => {

    const response =
      await api.get(
        `/api/Productos/${id}`
      );


    return response.data;
  },


  crear: async (producto) => {

    const response =
      await api.post(
        "/api/Productos",
        producto
      );


    return response.data;
  },


  modificar: async (
    id,
    producto
  ) => {

    const response =
      await api.put(
        `/api/Productos/${id}`,
        producto
      );


    return response.data;
  },


  cambiarDisponibilidad:
    async (
      id,
      disponible
    ) => {

      const response =
        await api.patch(
          `/api/Productos/${id}/disponibilidad`,
          {
            disponible,
          }
        );


      return response.data;
    },


  cambiarEstado:
    async (
      id,
      activo
    ) => {

      const response =
        await api.patch(
          `/api/Productos/${id}/estado`,
          {
            activo,
          }
        );


      return response.data;
    },

};


export default productoService;