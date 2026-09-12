import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.jsx';
import RevenueEvolution from './components/RevenueEvolution.jsx';
import './index.css';

function Router() {
  const [route, setRoute] = useState(
    window.location.hash || '#/visao-executiva',
  );

  useEffect(() => {
    function handleHashChange() {
      setRoute(window.location.hash || '#/visao-executiva');
    }

    window.addEventListener('hashchange', handleHashChange);

    if (!window.location.hash) {
      window.location.hash = '#/visao-executiva';
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  if (route === '#/evolucao-receita') {
    return <RevenueEvolution />;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
);