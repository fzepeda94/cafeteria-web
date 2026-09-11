import {
  useEffect,
  useState,
} from "react";

import {
  CircleDollarSign,
  ClipboardClock,
  ClipboardList,
  Package,
  PackageCheck,
  Tags,
  Users,
} from "lucide-react";

import Swal from "sweetalert2";

import dashboardService
  from "../services/dashboardService";


function Dashboard() {

  const [
    resumen,
    setResumen,
  ] = useState(null);


  const [
    cargando,
    setCargando,
  ] = useState(true);

  useEffect(() => {

    const cargarDashboard =
      async () => {

        try {

          const data =
            await dashboardService
              .obtenerResumen();


          setResumen(data);

        } catch (error) {

          console.error(error);


          await Swal.fire({

            title:
              "Error",

            text:
              "No fue posible cargar la información del Dashboard.",

            icon:
              "error",

            confirmButtonText:
              "Aceptar",
          });

        } finally {

          setCargando(false);
        }
      };


    cargarDashboard();

  }, []);

  const formatoMoneda =
    new Intl.NumberFormat(
      "es-GT",
      {
        style: "currency",
        currency: "GTQ",
      }
    );

  if (cargando) {

    return (

      <div className="loading-content">

        <div className="spinner"></div>

        <p>
          Cargando Dashboard...
        </p>

      </div>
    );
  }

  const tarjetas = [

    {
      titulo:
        "Clientes activos",

      valor:
        resumen?.totalClientes ?? 0,

      descripcion:
        "Clientes registrados",

      icono:
        Users,

      tipo:
        "brown",
    },

    {
      titulo:
        "Categorías",

      valor:
        resumen?.totalCategorias ?? 0,

      descripcion:
        "Categorías activas",

      icono:
        Tags,

      tipo:
        "orange",
    },

    {
      titulo:
        "Productos",

      valor:
        resumen?.totalProductos ?? 0,

      descripcion:
        "Productos activos",

      icono:
        Package,

      tipo:
        "blue",
    },

    {
      titulo:
        "Disponibles",

      valor:
        resumen?.productosDisponibles ?? 0,

      descripcion:
        "Productos disponibles",

      icono:
        PackageCheck,

      tipo:
        "green",
    },

    {
      titulo:
        "Pedidos de hoy",

      valor:
        resumen?.pedidosHoy ?? 0,

      descripcion:
        "Pedidos registrados hoy",

      icono:
        ClipboardList,

      tipo:
        "purple",
    },

    {
      titulo:
        "Pendientes",

      valor:
        resumen?.pedidosPendientes ?? 0,

      descripcion:
        "Esperando preparación",

      icono:
        ClipboardClock,

      tipo:
        "red",
    },

  ];


  return (

    <div>

      <div className="page-header">

        <div>

          <p className="page-eyebrow">
            RESUMEN GENERAL
          </p>

          <h1>
            Dashboard
          </h1>

          <p>
            Estado actual del sistema de
            cafetería.
          </p>

        </div>

      </div>


      <div className="dashboard-grid">

        {tarjetas.map(
          ({
            titulo,
            valor,
            descripcion,
            icono: Icono,
            tipo,
          }) => (

            <article
              className="dashboard-card"
              key={titulo}
            >

              <div
                className={
                  `dashboard-icon ${tipo}`
                }
              >

                <Icono size={24} />

              </div>


              <div className="dashboard-card-data">

                <span>
                  {titulo}
                </span>

                <strong>
                  {valor}
                </strong>

                <small>
                  {descripcion}
                </small>

              </div>

            </article>

          )
        )}

      </div>


      <section className="sales-card">

        <div>

          <div className="sales-icon">

            <CircleDollarSign
              size={30}
            />

          </div>

        </div>


        <div>

          <p>
            Ventas del día
          </p>

          <h2>
            {
              formatoMoneda.format(
                resumen?.ventasHoy ?? 0
              )
            }
          </h2>

          <span>
            Total correspondiente a pedidos
            entregados durante el día.
          </span>

        </div>

      </section>


      <section className="week-card">

        <div>

          <span className="week-badge">
            SEMANA 9
          </span>

          <h2>
            FrontEnd conectado
            correctamente
          </h2>

          <p>
            React está consumiendo datos
            reales del backend protegido
            mediante JWT.
          </p>

        </div>


        <div className="week-status">

          <span>
            API conectada
          </span>

          <span>
            JWT activo
          </span>

          <span>
            Azure SQL
          </span>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;