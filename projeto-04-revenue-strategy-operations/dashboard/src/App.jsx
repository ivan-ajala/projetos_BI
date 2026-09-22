import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import "./App.css";
import "./components/RevenueForecast.css";

import Navigation from "./components/Navigation";
import RevenueEvolution from "./components/RevenueEvolution";
import RevenueForecast from "./components/RevenueForecast";

import {
  formatCurrency,
  formatMonthYear,
  formatNumber,
} from "./utils/formatters";

function App() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboardSummary() {
      try {
        const response = await fetch("/data/dashboard_summary.json");

        if (!response.ok) {
          throw new Error(
            `Erro ao carregar o resumo: HTTP ${response.status}`,
          );
        }

        const data = await response.json();
        setSummary(data);
      } catch (loadError) {
        setError(loadError);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardSummary();
  }, []);

  if (loading) {
    return <div className="status-message">Carregando dados...</div>;
  }

  if (error) {
    return (
      <div className="status-message error-message">
        Erro ao carregar os dados: {error.message}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="status-message">
        Nenhum dado de resumo disponível.
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <DashboardHeader summary={summary} />

      <Navigation />

      <main className="dashboard-main">
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/visao-executiva" replace />}
          />

          <Route
            path="/visao-executiva"
            element={<ExecutivePage summary={summary} />}
          />

          <Route
            path="/evolucao-receita"
            element={<RevenueEvolution />}
          />

          <Route
            path="*"
            element={<Navigate to="/visao-executiva" replace />}
          />
        </Routes>
      </main>
      <DashboardFooter />
    </div>
  );
}

function DashboardHeader({ summary }) {
  const location = useLocation();
  const revenue = summary?.revenue ?? {};

  const isRevenueEvolution =
    location.pathname === "/evolucao-receita";

  const title = isRevenueEvolution
    ? "Evolução da Receita"
    : "Revenue Strategy & Operations";

  const subtitle = isRevenueEvolution
    ? "Análise histórica e projeção mensal"
    : "Visão Executiva";

  return (
    <header className="dashboard-header">
      <div className="header-brand">
        <img
          src="/ia-datia-logo.png"
          alt="Logo datIA"
          className="header-logo"
        />

        <div className="header-title">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="header-period">
        {isRevenueEvolution ? "Histórico e projeção mensal" : (
          <>
            {formatMonthYear(revenue.first_month)} —{" "}
            {formatMonthYear(revenue.last_month)}
          </>
        )}
      </div>
    </header>
  );
}

function ExecutivePage({ summary }) {
  const revenue = summary?.revenue ?? {};
  const customers = summary?.customers ?? {};
  const forecast = summary?.forecast ?? {};

  return (
    <>
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">DESEMPENHO HISTÓRICO</p>
            <h2>Receita e pedidos</h2>
          </div>

          <span className="section-meta">
            {formatNumber(revenue.total_months_observed)} meses observados
          </span>
        </div>

        <div className="kpi-grid">
          <KpiCard
            label="Valor bruto total"
            value={formatCurrency(revenue.total_gross_revenue)}
            accent="blue"
          />

          <KpiCard
            label="Total de pedidos"
            value={formatNumber(revenue.total_orders)}
            accent="green"
          />

          <KpiCard
            label="Ticket médio"
            value={formatCurrency(revenue.average_ticket_overall)}
            accent="purple"
          />

          <KpiCard
            label="Meses no calendário"
            value={formatNumber(revenue.total_months_calendar)}
            accent="orange"
          />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">BASE DE CLIENTES</p>
            <h2>Clientes e segmentação</h2>
          </div>
        </div>

        <div className="kpi-grid kpi-grid-small">
          <KpiCard
            label="Clientes únicos"
            value={formatNumber(customers.total_unique_customers)}
            accent="blue"
          />

          <KpiCard
            label="Segmentos identificados"
            value={formatNumber(customers.total_segments)}
            accent="purple"
          />
        </div>
      </section>

      <section className="dashboard-section forecast-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">ESTIMATIVA DIRECIONAL</span>
            <h2>Projeção de Receita</h2>
          </div>

          <span className="section-period">
            {formatMonthYear(forecast.forecast_start_month)} —{" "}
            {formatMonthYear(forecast.forecast_end_month)}
          </span>
        </div>

        <div className="kpi-grid forecast-grid">
          <div className="kpi-card forecast-card forecast-card-primary">
            <h3>Receita projetada</h3>
            <p>{formatCurrency(forecast.forecast_total_gross_revenue)}</p>
            <span className="card-description">
              Total estimado para o horizonte projetado
            </span>
          </div>

          <div className="kpi-card forecast-card">
            <h3>Horizonte da projeção</h3>
            <p>{forecast.forecast_horizon_months} meses</p>
            <span className="card-description">
              De {formatMonthYear(forecast.forecast_start_month)} a{" "}
              {formatMonthYear(forecast.forecast_end_month)}
            </span>
          </div>

          <div className="kpi-card forecast-card">
            <h3>Modelo utilizado</h3>
            <p className="model-value">
              {formatModelName(forecast.model_used)}
            </p>
            <span className="card-description">
              Modelo selecionado na comparação histórica
            </span>
          </div>

          <div className="kpi-card forecast-card">
            <h3>Erro aproximado — RMSE</h3>
            <p>{formatCurrency(forecast.approximate_error_rmse)}</p>
            <span className="card-description">
              Faixa aproximada de incerteza
            </span>
          </div>
        </div>

        <RevenueForecast />

        <div className="forecast-methodology">
          <h3>Como interpretar esta projeção</h3>

          <p>
            A projeção é uma estimativa direcional baseada no comportamento
            histórico da receita. O horizonte projetado cobre{" "}
            <strong>
              {formatMonthYear(forecast.forecast_start_month)} a{" "}
              {formatMonthYear(forecast.forecast_end_month)}
            </strong>
            .
          </p>

          <p>
            O erro aproximado de{" "}
            <strong>{formatCurrency(forecast.approximate_error_rmse)}</strong>{" "}
            corresponde ao RMSE observado no conjunto de teste. Essa faixa é
            uma aproximação prática e não representa um intervalo de confiança
            estatístico formal.
          </p>
        </div>
      </section>

      <section className="dashboard-section notes-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">CONTEXTO ANALÍTICO</span>
            <h2>Leitura dos resultados</h2>
          </div>
        </div>

        <div className="context-grid">
          <article className="context-card">
            <h3>Base histórica</h3>
            <p>
              O histórico reúne dados de setembro de 2016 a outubro de 2018,
              totalizando 25 meses com pedidos observados.
            </p>
          </article>

          <article className="context-card">
            <h3>Janela de modelagem</h3>
            <p>
              A projeção utiliza uma janela mais consistente a partir de 2017,
              reduzindo o efeito da cobertura parcial e da lacuna observada em
              2016.
            </p>
          </article>

          <article className="context-card context-card-highlight">
            <h3>Interpretação do forecast</h3>
            <p>
              A projeção é uma estimativa direcional. A faixa de incerteza é
              aproximada e não representa um intervalo de confiança
              estatístico formal.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}


function KpiCard({ label, value, accent }) {
  return (
    <article className={`kpi-card kpi-${accent}`}>
      <span className="kpi-label">{label}</span>
      <strong className="kpi-value">{value}</strong>
    </article>
  );
}

function DashboardFooter() {
  return (
    <footer className="dashboard-footer">
      <p>
        Revenue Strategy & Operations · Análise de receita e projeção de
        vendas · Dashboard by Ivan
      </p>
    </footer>
  );
}

function formatModelName(modelName) {
  const modelNames = {
    moving_average_3m: "Média móvel de 3 meses",
    "Média móvel - 3 meses": "Média móvel de 3 meses",
    naive: "Ingênuo",
    "Naive - último valor": "Ingênuo — último valor",
    seasonal_naive: "Ingênuo sazonal",
    linear_trend: "Tendência linear",
    "Drift - tendência linear": "Tendência linear — Drift",
    holt_winters: "Holt-Winters",
  };

  return modelNames[modelName] || modelName || "Não informado";
}

export default App;