import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const getLinkClass = ({ isActive }) =>
    `nav-link${isActive ? ' nav-link-active' : ''}`;

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <div className="brand-mark">S</div>

          <div>
            <div className="brand-title">SECOM Quality Analytics</div>
            <div className="brand-subtitle">
              Sensor impact and failure analysis
            </div>
          </div>
        </div>

        <nav className="navigation">
          <NavLink to="/" end className={getLinkClass}>
            Visão Geral
          </NavLink>

          <NavLink to="/sensores" className={getLinkClass}>
            Análise de Sensores
          </NavLink>

          <NavLink to="/diagnostico" className={getLinkClass}>
            Diagnóstico do Modelo
          </NavLink>

          <NavLink to="/dicionario" className={getLinkClass}>
            Dicionário de Dados
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
