import api from "../api/api";

const authService = {

  login: async (correo, password) => {

    const response = await api.post(
      "/api/Auth/login",
      {
        correo,
        password,
      }
    );

    return response.data;
  },


  me: async () => {

    const response = await api.get(
      "/api/Auth/me"
    );

    return response.data;
  },

};

export default authService;