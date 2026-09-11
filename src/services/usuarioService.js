import api from "../api/api";

const usuarioService = {
  obtener: async () => {
    const response = await api.get("/api/Usuarios");
    return response.data;
  },
};

export default usuarioService;