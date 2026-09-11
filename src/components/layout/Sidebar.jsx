import {
  BarChart3,
  ClipboardList,
  Coffee,
  LayoutDashboard,
  Package,
  Tags,
  UserCog,
  Users,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Sidebar() {
  const { tieneRol } = useAuth();
  const esAdministrador = tieneRol("ADMINISTRADOR");

  const claseNav = ({ isActive }) =>
    isActive ? "nav-item active" : "nav-item";

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Coffee size={26} />
        </div>

        <div>
          <h1>Cafetería</h1>
          <span>UMG Petén</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section">PRINCIPAL</p>

        <NavLink to="/dashboard" className={claseNav}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <p className="nav-section">CATÁLOGOS</p>

        {esAdministrador && (
          <NavLink to="/categorias" className={claseNav}>
            <Tags size={20} />
            <span>Categorías</span>
          </NavLink>
        )}

        <NavLink to="/productos" className={claseNav}>
          <Package size={20} />
          <span>Productos</span>
        </NavLink>

        <p className="nav-section">OPERACIÓN</p>

        <NavLink to="/clientes" className={claseNav}>
          <Users size={20} />
          <span>Clientes</span>
        </NavLink>

        <NavLink to="/pedidos" className={claseNav}>
          <ClipboardList size={20} />
          <span>Pedidos</span>
        </NavLink>

        {esAdministrador && (
          <>
            <p className="nav-section">ADMINISTRACIÓN</p>

            <NavLink to="/reportes" className={claseNav}>
              <BarChart3 size={20} />
              <span>Reportes</span>
            </NavLink>

            <NavLink to="/usuarios" className={claseNav}>
              <UserCog size={20} />
              <span>Usuarios</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <span>Desarrollo Web</span>
        <strong>Semana 10</strong>
      </div>
    </aside>
  );
}

export default Sidebar;