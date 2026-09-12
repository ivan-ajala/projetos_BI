function Navigation() {
  const currentHash = window.location.hash || '#/visao-executiva';

  return (
    <nav className="dashboard-navigation" aria-label="Navegação principal">
      <a
        href="#/visao-executiva"
        className={
          currentHash === '#/visao-executiva' || currentHash === '#/'
            ? 'navigation-link active'
            : 'navigation-link'
        }
      >
        Visão Executiva
      </a>

      <a
        href="#/evolucao-receita"
        className={
          currentHash === '#/evolucao-receita'
            ? 'navigation-link active'
            : 'navigation-link'
        }
      >
        Evolução da Receita
      </a>
    </nav>
  );
}

export default Navigation;