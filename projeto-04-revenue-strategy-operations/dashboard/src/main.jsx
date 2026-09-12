// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
// import App from './App.jsx'; // Comente esta linha
import RevenueEvolution from './components/RevenueEvolution.jsx'; // Importe a nova página
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <App /> */}{' '}
    {/* Comente esta linha */}
    <RevenueEvolution /> {/* Renderize a nova página */}
  </React.StrictMode>,
);