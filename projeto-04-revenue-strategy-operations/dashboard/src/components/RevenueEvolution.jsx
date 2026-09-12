// src/components/RevenueEvolution.jsx
import React, { useEffect, useState } from 'react';
import Navigation from './Navigation'; // Importa o componente de navegação

import {
  formatCurrency,
  formatNumber,
  formatMonthYear,
} from '../utils/formatters';

import { parseCsv } from '../utils/csvParser';

function RevenueEvolution() {
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEvolutionData() {
      try {
        const [monthlyResponse, forecastResponse] = await Promise.all([
          fetch('/data/monthly_revenue.csv'),
          fetch('/data/revenue_forecast.csv'),
        ]);

        if (!monthlyResponse.ok) {
          throw new Error(
            `Erro ao carregar o histórico mensal: HTTP ${monthlyResponse.status}`,
          );
        }
        if (!forecastResponse.ok) {
          throw new Error(
            `Erro ao carregar o forecast: HTTP ${forecastResponse.status}`,
          );
        }

        const monthlyCsv = await monthlyResponse.text();
        const forecastCsv = await forecastResponse.text();

        const parsedMonthly = parseCsv(monthlyCsv);
        const parsedForecast = parseCsv(forecastCsv);

        setMonthlyRevenue(parsedMonthly);
        setForecastData(parsedForecast);
      } catch (loadError) {
        setError(loadError);
      } finally {
        setLoading(false);
      }
    }

    loadEvolutionData();
  }, []);

  if (loading) {
    return <div className="status-message">Carregando evolução da receita...</div>;
  }

  if (error) {
    return (
      <div className="status-message error-message">
        Erro ao carregar dados de evolução: {error.message}
      </div>
    );
  }

  // Lógica para calcular KPIs e preparar dados para o gráfico virá aqui
  // Por enquanto, apenas um placeholder

  // Encontra o primeiro mês do histórico e o último mês do forecast para o período
  const firstMonth = monthlyRevenue.length > 0 ? monthlyRevenue[0].purchase_month : '';
  const lastMonth = forecastData.length > 0 ? forecastData[forecastData.length - 1].forecast_month : '';


  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-brand">
          <img
            src="/ia-datia-logo.png"
            alt="Logo datIA"
            className="header-logo"
          />
          <div className="header-title">
            <h1>Evolução da Receita</h1>
            <p>Análise histórica e projeção mensal</p>
          </div>
        </div>
        <div className="header-period">
          {/* Período dinâmico será adicionado aqui */}
          Período: {formatMonthYear(firstMonth)} — {formatMonthYear(lastMonth)}
        </div>
      </header>

      <Navigation /> {/* Adiciona o componente de navegação aqui */}

      <main className="dashboard-main">
        <section className="dashboard-section">
          <div className="section-heading">
            <h2>KPIs de Evolução</h2>
          </div>
          <div className="kpi-grid">
            {/* Cards de KPIs virão aqui */}
            <KpiCard label="Maior Receita Mensal" value="R$ X.XXX.XXX" accent="blue" />
            <KpiCard label="Menor Receita Mensal" value="R$ Y.YYY.YYY" accent="orange" />
            <KpiCard label="Crescimento Médio Mensal" value="Z.Z%" accent="green" />
            <KpiCard label="Receita Próximo Mês" value="R$ W.WWW.WWW" accent="purple" />
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <h2>Gráfico de Evolução</h2>
          </div>
          <div className="chart-container">
            {/* Gráfico virá aqui */}
            <p>Gráfico de linhas de receita histórica e projetada.</p>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <h2>Dados Detalhados</h2>
          </div>
          <div className="table-container">
            {/* Tabela de dados virá aqui */}
            <p>Tabela com histórico e projeção mensal.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

// Reutilizando KpiCard do App.jsx
function KpiCard({ label, value, accent }) {
  return (
    <article className={`kpi-card kpi-${accent}`}>
      <span className="kpi-label">{label}</span>
      <strong className="kpi-value">{value}</strong>
    </article>
  );
}

export default RevenueEvolution;