import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  ToastContainer,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";


import ProtectedRoute
  from "./components/ProtectedRoute";

import Layout
  from "./components/layout/Layout";

import Dashboard
  from "./pages/Dashboard";

import Login
  from "./pages/Login";


function App() {

  return (

    <>

      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          element={<ProtectedRoute />}
        >

          <Route
            element={<Layout />}
          >

            <Route
              path="/"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />


            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

          </Route>

        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />

    </>
  );
}

export default App;