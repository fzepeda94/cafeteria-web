import {
  Coffee,
  LayoutDashboard,
  Tags,
  Package,
  Users,
  ClipboardList,
  BarChart3,
  UserCog,
  LockKeyhole,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";


function Sidebar() {

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

        <p className="nav-section">
          PRINCIPAL
        </p>


        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive
              ? "nav-item active"
              : "nav-item"
          }
        >
          <LayoutDashboard size={20} />

          <span>
            Dashboard
          </span>
        </NavLink>


        <p className="nav-section">
          SEMANA 10
        </p>


        <div className="nav-item disabled">
          <Tags size={20} />

          <span>
            Categorías
          </span>

          <LockKeyhole
            size={14}
            className="nav-lock"
          />
        </div>


        <div className="nav-item disabled">
          <Package size={20} />

          <span>
            Productos
          </span>

          <LockKeyhole
            size={14}
            className="nav-lock"
          />
        </div>


        <div className="nav-item disabled">
          <Users size={20} />

          <span>
            Clientes
          </span>

          <LockKeyhole
            size={14}
            className="nav-lock"
          />
        </div>


        <div className="nav-item disabled">
          <ClipboardList size={20} />

          <span>
            Pedidos
          </span>

          <LockKeyhole
            size={14}
            className="nav-lock"
          />
        </div>


        <div className="nav-item disabled">
          <BarChart3 size={20} />

          <span>
            Reportes
          </span>

          <LockKeyhole
            size={14}
            className="nav-lock"
          />
        </div>


        <div className="nav-item disabled">
          <UserCog size={20} />

          <span>
            Usuarios
          </span>

          <LockKeyhole
            size={14}
            className="nav-lock"
          />
        </div>

      </nav>


      <div className="sidebar-footer">

        <span>
          Desarrollo Web
        </span>

        <strong>
          Semana 9
        </strong>

      </div>

    </aside>
  );
}


export default Sidebar;