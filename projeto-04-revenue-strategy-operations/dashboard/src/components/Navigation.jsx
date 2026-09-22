import { NavLink } from "react-router-dom";

function Navigation() {
  return (
    <nav
      className="dashboard-navigation"
      aria-label="Navegação principal"
    >
      <NavLink
        to="/visao-executiva"
        className={({ isActive }) =>
          isActive
            ? "navigation-link active"
            : "navigation-link"
        }
      >
        Visão Executiva
      </NavLink>

      <NavLink
        to="/evolucao-receita"
        className={({ isActive }) =>
          isActive
            ? "navigation-link active"
            : "navigation-link"
        }
      >
        Evolução da Receita
      </NavLink>
    </nav>
  );
}

export default Navigation;