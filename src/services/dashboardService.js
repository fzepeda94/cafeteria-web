import api from "../api/api";

const dashboardService = {

  obtenerResumen: async () => {

    const response = await api.get(
      "/api/Dashboard/resumen"
    );

    return response.data;
  },

};

export default dashboardService;