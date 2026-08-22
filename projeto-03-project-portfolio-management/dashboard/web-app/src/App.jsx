import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useState, useMemo } from 'react'
import './App.css'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, } from 'recharts'
import { buildRiskSummary, buildRiskRanking, getUniqueRiskValues, getRiskLevelClass, } from './utils/riskMetrics'
import { usePortfolioData } from './utils/usePortfolioData'
import { buildExecutiveKpis, buildStatusDistribution, buildMonthlySeries, formatCurrency, formatPercent, } from './utils/portfolioMetrics'
import { applyPortfolioFilters, getUniqueValues } from './utils/portfolioFilters'
import KpiCard from './components/KpiCard'
import StatusBadge from './components/StatusBadge'

import { buildPerformanceKpis, buildQualityDistribution, buildBusinessUnitPerformance, buildBusinessUnitRadarData, buildVarianceDistribution, buildProjectHealthSummary, } from './utils/performanceMetrics'
import { buildTrendKpis, buildVolumeSeries, buildPortfolioCompositionSeries, buildBudgetTrendSeries, buildTeamSizeSeries, buildYearlySummary, } from './utils/trendMetrics'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, } from 'recharts'
import { LineChart, Line, AreaChart, Area, ComposedChart, } from 'recharts'
import IALogo from "./assets/IA_logo.png";

function Topbar() {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="brand">
          <div className="brand-mark">
              <img src={IALogo} alt="datIA" />
          </div>
          <div>
            <p className="brand-title">Project Portfolio Management</p>
            <p className="brand-subtitle">Portfolio Analytics</p>
          </div>
        </div>

        <nav className="app-navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            Visão Executiva
          </NavLink>
          <NavLink
            to="/portfolio"
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            Portfólio
          </NavLink>
          <NavLink
            to="/riscos"
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            Riscos e Alertas
          </NavLink>
          <NavLink
            to="/desempenho"
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            Desempenho
          </NavLink>
          <NavLink
            to="/tendencias"
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            Tendências
          </NavLink>
          <NavLink
            to="/dicionario"
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
          >
            Dicionário
          </NavLink>

          
        </nav>
      </div>
    </header>
  )
}

function PageHeader({ title, subtitle }) {
  return (
    <div className="page-header">
      <h1 className="page-title">{title}</h1>
      <p className="page-subtitle">{subtitle}</p>
    </div>
  )
}

function Placeholder({ label }) {
  return (
    <div className="surface-card" style={{ padding: '32px', textAlign: 'center' }}>
      <p className="chart-subtitle" style={{ margin: 0 }}>
        Conteúdo de "{label}" será implementado no próximo passo.
      </p>
    </div>
  )
}

const STATUS_COLORS = ['#0f4c5c', '#2c7a7b', '#d97706', '#b91c1c', '#94a3b8']

function VisaoExecutiva() {
  const { analytics, risk, monthly, loading, error } = usePortfolioData()

  if (loading) {
    return (
      <div className="page">
        <PageHeader
          title="Visão Executiva"
          subtitle="Panorama geral do portfólio: quantidade de projetos, investimento, riscos e desempenho consolidado."
        />
        <div className="state-message">Carregando dados do portfólio...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <PageHeader
          title="Visão Executiva"
          subtitle="Panorama geral do portfólio: quantidade de projetos, investimento, riscos e desempenho consolidado."
        />
        <div className="state-message">Erro ao carregar dados: {error}</div>
      </div>
    )
  }

  const kpis = buildExecutiveKpis(analytics, risk)
  const statusData = buildStatusDistribution(analytics)
  const monthlyData = buildMonthlySeries(monthly)

  return (
    <div className="page">
      <PageHeader
        title="Visão Executiva"
        subtitle="Panorama geral do portfólio: quantidade de projetos, investimento, riscos e desempenho consolidado."
      />

      <div className="kpi-grid">
        <KpiCard label="Total de Projetos" value={kpis.total} />
        <KpiCard label="Projetos Ativos" value={kpis.activeCount} tone="accent" />
        <KpiCard label="Orçamento Planejado" value={formatCurrency(kpis.plannedBudget)} />
        <KpiCard label="Custo Realizado" value={formatCurrency(kpis.actualCost)} />
        <KpiCard label="Concluídos no Prazo" value={formatPercent(kpis.onTimePct)} tone="success" />
        <KpiCard label="Projetos em Risco Alto" value={`${kpis.highRiskTotal ?? 0}`} tone="danger" />
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h2 className="chart-title">Evolução do Orçamento (mensal)</h2>
          <p className="chart-subtitle">Planejado vs. realizado nos projetos ativos por mês.</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} interval={5} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="planejado" name="Planejado" fill="#0f4c5c" radius={[4, 4, 0, 0]} />
              <Bar dataKey="realizado" name="Realizado" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2 className="chart-title">Distribuição por Status</h2>
          <p className="chart-subtitle">Proporção de projetos por status no portfólio.</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={95}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

const PAGE_SIZE = 15

function Portfolio() {
  const { analytics, loading, error } = usePortfolioData()

  const [status, setStatus] = useState('')
  const [businessUnit, setBusinessUnit] = useState('')
  const [year, setYear] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const statusOptions = useMemo(() => getUniqueValues(analytics, 'project_status'), [analytics])
  const businessUnitOptions = useMemo(() => getUniqueValues(analytics, 'business_unit'), [analytics])
  const yearOptions = useMemo(() => getUniqueValues(analytics, 'start_year'), [analytics])

  const filtered = useMemo(
    () => applyPortfolioFilters(analytics, { status, businessUnit, year, search }),
    [analytics, status, businessUnit, year, search]
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleFilterChange(setter) {
    return (event) => {
      setter(event.target.value)
      setPage(1)
    }
  }

  function clearFilters() {
    setStatus('')
    setBusinessUnit('')
    setYear('')
    setSearch('')
    setPage(1)
  }

  if (loading) {
    return (
      <div className="page">
        <PageHeader
          title="Portfólio"
          subtitle="Lista detalhada de projetos, com filtros por status, área de negócio, risco e período."
        />
        <div className="state-message">Carregando dados do portfólio...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <PageHeader
          title="Portfólio"
          subtitle="Lista detalhada de projetos, com filtros por status, área de negócio, risco e período."
        />
        <div className="state-message">Erro ao carregar dados: {error}</div>
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader
        title="Portfólio"
        subtitle="Lista detalhada de projetos, com filtros por status, área de negócio, risco e período."
      />

      <div className="filters-bar">
        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-status">Status</label>
          <select id="filter-status" className="filter-select" value={status} onChange={handleFilterChange(setStatus)}>
            <option value="">Todos</option>
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-bu">Área de Negócio</label>
          <select id="filter-bu" className="filter-select" value={businessUnit} onChange={handleFilterChange(setBusinessUnit)}>
            <option value="">Todas</option>
            {businessUnitOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-year">Ano de Início</label>
          <select id="filter-year" className="filter-select" value={year} onChange={handleFilterChange(setYear)}>
            <option value="">Todos</option>
            {yearOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="filter-group filter-group-grow">
          <label className="filter-label" htmlFor="filter-search">Buscar (projeto ou gestor)</label>
          <input
            id="filter-search"
            className="filter-input"
            type="text"
            placeholder="Ex.: Vargas, Ana Beatriz..."
            value={search}
            onChange={handleFilterChange(setSearch)}
          />
        </div>

        <button type="button" className="filter-clear-btn" onClick={clearFilters}>
          Limpar filtros
        </button>
      </div>

      <p className="results-count">
        {filtered.length} projeto(s) encontrado(s) de {analytics.length} no total.
      </p>

      <div className="surface-card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Projeto</th>
                <th>Gestor</th>
                <th>Área</th>
                <th>Status</th>
                <th>Orçamento Planejado</th>
                <th>Custo Real</th>
                <th>Variação de Custo</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((row) => (
                <tr key={row.project_id}>
                  <td>{row.project_name}</td>
                  <td>{row.project_manager}</td>
                  <td>{row.business_unit}</td>
                  <td><StatusBadge status={row.project_status} /></td>
                  <td>{formatCurrency(row.planned_budget)}</td>
                  <td>{formatCurrency(row.actual_cost)}</td>
                  <td>{formatPercent(row.cost_variance_pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </button>
          <span className="pagination-info">Página {currentPage} de {totalPages}</span>
          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  )
}

function Riscos() {
  const { risk, loading, error } = usePortfolioData()

  const [scheduleLevel, setScheduleLevel] = useState('')
  const [costLevel, setCostLevel] = useState('')
  const [businessUnit, setBusinessUnit] = useState('')

  const filteredRisk = useMemo(() => {
    return risk.filter((row) => {
      if (scheduleLevel && row.schedule_risk_level !== scheduleLevel) {
        return false
      }

      if (costLevel && row.cost_risk_level !== costLevel) {
        return false
      }

      if (businessUnit && row.business_unit !== businessUnit) {
        return false
      }

      return true
    })
  }, [risk, scheduleLevel, costLevel, businessUnit])

  const riskSummary = useMemo(
    () => buildRiskSummary(filteredRisk),
    [filteredRisk]
  )

  const riskRanking = useMemo(
    () => buildRiskRanking(filteredRisk).slice(0, 15),
    [filteredRisk]
  )

  const scheduleOptions = useMemo(
    () => getUniqueRiskValues(risk, 'schedule_risk_level'),
    [risk]
  )

  const costOptions = useMemo(
    () => getUniqueRiskValues(risk, 'cost_risk_level'),
    [risk]
  )

  const businessUnitOptions = useMemo(
    () => getUniqueRiskValues(risk, 'business_unit'),
    [risk]
  )

  function clearRiskFilters() {
    setScheduleLevel('')
    setCostLevel('')
    setBusinessUnit('')
  }

  if (loading) {
    return (
      <div className="page">
        <PageHeader
          title="Riscos e Alertas"
          subtitle="Projetos com maior probabilidade de estouro de prazo ou custo, segundo o modelo preditivo."
        />
        <div className="state-message">Carregando dados de risco...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <PageHeader
          title="Riscos e Alertas"
          subtitle="Projetos com maior probabilidade de estouro de prazo ou custo, segundo o modelo preditivo."
        />
        <div className="state-message">Erro ao carregar dados: {error}</div>
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader
        title="Riscos e Alertas"
        subtitle="Projetos com maior probabilidade de estouro de prazo ou custo, segundo o modelo preditivo."
      />

      <div className="filters-bar">
        <div className="filter-group">
          <label className="filter-label" htmlFor="risk-schedule">
            Risco de Prazo
          </label>
          <select
            id="risk-schedule"
            className="filter-select"
            value={scheduleLevel}
            onChange={(event) => setScheduleLevel(event.target.value)}
          >
            <option value="">Todos</option>
            {scheduleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label" htmlFor="risk-cost">
            Risco de Custo
          </label>
          <select
            id="risk-cost"
            className="filter-select"
            value={costLevel}
            onChange={(event) => setCostLevel(event.target.value)}
          >
            <option value="">Todos</option>
            {costOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group filter-group-grow">
          <label className="filter-label" htmlFor="risk-business-unit">
            Área de Negócio
          </label>
          <select
            id="risk-business-unit"
            className="filter-select"
            value={businessUnit}
            onChange={(event) => setBusinessUnit(event.target.value)}
          >
            <option value="">Todas</option>
            {businessUnitOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="filter-clear-btn"
          onClick={clearRiskFilters}
        >
          Limpar filtros
        </button>
      </div>

      <div className="kpi-grid">
        <KpiCard
          label="Projetos Avaliados"
          value={riskSummary.total}
        />
        <KpiCard
          label="Alto Risco de Prazo"
          value={riskSummary.highSchedule}
          tone="danger"
        />
        <KpiCard
          label="Alto Risco de Custo"
          value={riskSummary.highCost}
          tone="accent"
        />
        <KpiCard
          label="Risco Alto Combinado"
          value={riskSummary.highCombined}
          tone="danger"
        />
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h2 className="chart-title">Projetos com maior exposição</h2>
          <p className="chart-subtitle">
            Maior probabilidade predita entre risco de prazo e risco de custo.
          </p>

          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={riskRanking.slice(0, 10)}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 80, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
              />
              <XAxis
                type="number"
                domain={[0, 1]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="project_id"
                tick={{ fontSize: 11 }}
                width={54}
              />
              <Tooltip
                formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`}
              />
              <Bar
                dataKey="combinedRiskScore"
                name="Maior probabilidade"
                fill="#b4534b"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2 className="chart-title">Leitura do risco</h2>
          <p className="chart-subtitle">
            O filtro atual considera {riskSummary.total} projeto(s).
          </p>

          <div className="risk-empty">
            <p>
              <strong>{riskSummary.highCombined}</strong> projeto(s) apresentam
              risco alto de prazo ou custo.
            </p>
            <p>
              <strong>{riskSummary.moderateCombined}</strong> projeto(s)
              apresentam algum nível moderado de risco.
            </p>
            <p>
              A proporção de risco alto no recorte atual é de{' '}
              <strong>{formatPercent(riskSummary.highCombinedPct)}</strong>.
            </p>
          </div>
        </div>
      </div>

      <div className="risk-table-card">
        <h2 className="chart-title">Ranking de projetos prioritários</h2>
        <p className="chart-subtitle">
          Os 15 projetos com maior probabilidade de risco no recorte selecionado.
        </p>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Projeto</th>
                <th>Área</th>
                <th>Risco de Prazo</th>
                <th>Risco de Custo</th>
                <th>Prob. Prazo</th>
                <th>Prob. Custo</th>
                <th>Variação de Custo</th>
              </tr>
            </thead>
            <tbody>
              {riskRanking.map((row) => (
                <tr key={row.project_id}>
                  <td className="risk-project-name" title={row.project_name}>
                    {row.project_name}
                  </td>
                  <td>{row.business_unit}</td>
                  <td>
                    <span className={`badge ${getRiskLevelClass(row.schedule_risk_level)}`}>
                      {row.schedule_risk_level}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getRiskLevelClass(row.cost_risk_level)}`}>
                      {row.cost_risk_level}
                    </span>
                  </td>
                  <td className="risk-score">
                    {formatPercent((Number(row.predicted_schedule_risk_proba) || 0) * 100)}
                  </td>
                  <td className="risk-score">
                    {formatPercent((Number(row.predicted_cost_risk_proba) || 0) * 100)}
                  </td>
                  <td>
                    {formatPercent(Number(row.predicted_cost_variance_pct) || 0)}
                  </td>
                </tr>
              ))}

              {riskRanking.length === 0 && (
                <tr>
                  <td colSpan="7" className="risk-empty">
                    Nenhum projeto encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const RADAR_COLORS = ['#0f4c5c', '#d97706', '#2c7a7b', '#b4534b']

function Desempenho() {
  const { analytics, loading, error } = usePortfolioData()

  if (loading) {
    return (
      <div className="page">
        <PageHeader
          title="Desempenho"
          subtitle="Indicadores de prazo, custo, qualidade e satisfação do cliente ao longo do portfólio."
        />
        <div className="state-message">Carregando dados de desempenho...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <PageHeader
          title="Desempenho"
          subtitle="Indicadores de prazo, custo, qualidade e satisfação do cliente ao longo do portfólio."
        />
        <div className="state-message">Erro ao carregar dados: {error}</div>
      </div>
    )
  }

  const kpis = buildPerformanceKpis(analytics)
  const qualityData = buildQualityDistribution(analytics)
  const businessUnitData = buildBusinessUnitPerformance(analytics)
  const radarData = buildBusinessUnitRadarData(analytics)
  const varianceData = buildVarianceDistribution(analytics)
  const healthSummary = buildProjectHealthSummary(analytics)

  return (
    <div className="page">
      <PageHeader
        title="Desempenho"
        subtitle="Indicadores de prazo, custo, qualidade e satisfação do cliente ao longo do portfólio."
      />

      <div className="kpi-grid">
        <KpiCard label="Projetos Concluídos" value={kpis.completedProjects} />
        <KpiCard label="Entregues no Prazo" value={formatPercent(kpis.onTimeRate)} tone="success" />
        <KpiCard label="Dentro do Orçamento" value={formatPercent(kpis.withinBudgetRate)} tone="accent" />
        <KpiCard label="Satisfação Média" value={`${kpis.averageSatisfaction.toFixed(1)} / 10`} />
      </div>

      <div className="chart-grid">
        <div className="health-score-card">
          <span className="health-score-label">Índice de Saúde do Portfólio</span>
          <span className="health-score-value">{healthSummary.averageHealth.toFixed(1)}</span>
          <p className="health-score-note">
            Índice composto (0–100) que combina prazo, custo, qualidade e satisfação
            dos projetos concluídos. Não é um instrumento psicométrico validado,
            mas um indicador analítico de saúde do portfólio.
          </p>
        </div>

        <div className="chart-card">
          <h2 className="chart-title">Distribuição por Faixa de Saúde</h2>
          <p className="chart-subtitle">Classificação dos projetos concluídos por nível de saúde.</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={healthSummary.healthDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {healthSummary.healthDistribution.map((entry, index) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h2 className="chart-title">Radar de Desempenho por Área de Negócio</h2>
          <p className="chart-subtitle">Comparação de prazo, custo, qualidade e satisfação entre áreas.</p>
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={radarData} outerRadius={110}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="unit" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Prazo (%)" dataKey="Prazo (%)" stroke={RADAR_COLORS[0]} fill={RADAR_COLORS[0]} fillOpacity={0.15} />
              <Radar name="Custo (%)" dataKey="Custo (%)" stroke={RADAR_COLORS[1]} fill={RADAR_COLORS[1]} fillOpacity={0.15} />
              <Radar name="Qualidade (%)" dataKey="Qualidade (%)" stroke={RADAR_COLORS[2]} fill={RADAR_COLORS[2]} fillOpacity={0.15} />
              <Radar name="Satisfação (%)" dataKey="Satisfação (%)" stroke={RADAR_COLORS[3]} fill={RADAR_COLORS[3]} fillOpacity={0.15} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2 className="chart-title">Distribuição da Variação de Custo</h2>
          <p className="chart-subtitle">Faixas de estouro orçamentário nos projetos concluídos.</p>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={varianceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" name="Projetos" fill="#0f4c5c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="risk-table-card">
        <h2 className="chart-title">Desempenho por Área de Negócio</h2>
        <p className="chart-subtitle">Detalhamento numérico dos indicadores por unidade.</p>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Área</th>
                <th>Projetos</th>
                <th>No Prazo</th>
                <th>Dentro do Orçamento</th>
                <th>Qualidade Média</th>
                <th>Satisfação Média</th>
              </tr>
            </thead>
            <tbody>
              {businessUnitData.map((unit) => (
                <tr key={unit.unit}>
                  <td>{unit.unit}</td>
                  <td>{unit.projects}</td>
                  <td>{formatPercent(unit.onTimeRate)}</td>
                  <td>{formatPercent(unit.withinBudgetRate)}</td>
                  <td>{unit.averageQuality.toFixed(1)} / 10</td>
                  <td>{unit.averageSatisfaction.toFixed(1)} / 10</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function VolumeLegend() {
  const items = [
    { label: 'Iniciados', color: '#155e75', dashed: false },
    { label: 'Concluídos', color: '#16803c', dashed: false },
    { label: 'Cancelados', color: '#c62828', dashed: true },
  ]

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        marginTop: '10px',
        fontSize: '14px',
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: item.color,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '18px',
              borderTop: `2px ${item.dashed ? 'dashed' : 'solid'} ${item.color}`,
            }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function VolumeTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const order = ['Iniciados', 'Concluídos', 'Cancelados']

  const orderedPayload = order
    .map((name) => payload.find((item) => item.name === name))
    .filter(Boolean)

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        padding: '12px 16px',
        borderRadius: '2px',
        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.12)',
      }}
    >
      <p
        style={{
          margin: '0 0 8px',
          color: '#1e293b',
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        {label}
      </p>

      {orderedPayload.map((item) => (
        <p
          key={item.name}
          style={{
            margin: '5px 0',
            color: item.color,
            fontSize: '14px',
          }}
        >
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  )
}

function Tendencias() {
  const { monthly, loading, error } = usePortfolioData()

  const kpis = useMemo(() => buildTrendKpis(monthly), [monthly])
  const volumeSeries = useMemo(() => buildVolumeSeries(monthly), [monthly])
  const compositionSeries = useMemo(
    () => buildPortfolioCompositionSeries(monthly),
    [monthly]
  )
  const budgetSeries = useMemo(
    () => buildBudgetTrendSeries(monthly),
    [monthly]
  )
  const teamSizeSeries = useMemo(() => buildTeamSizeSeries(monthly), [monthly])
  const yearlySummary = useMemo(() => buildYearlySummary(monthly), [monthly])

  if (loading) {
    return (
      <div className="page">
        <PageHeader
          title="Tendências"
          subtitle="Evolução mensal do portfólio: novos projetos, conclusões, cancelamentos e investimento."
        />
        <p>Carregando dados...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <PageHeader
          title="Tendências"
          subtitle="Evolução mensal do portfólio: novos projetos, conclusões, cancelamentos e investimento."
        />
        <p>Erro ao carregar dados: {error}</p>
      </div>
    )
  }

  return (
    <div className="page">
      <PageHeader
        title="Tendências"
        subtitle="Evolução mensal do portfólio: novos projetos, conclusões, cancelamentos e investimento."
      />

      <div className="kpi-grid">
        <KpiCard label="Projetos Iniciados" value={kpis.totalStarting} />
        <KpiCard label="Projetos Concluídos" value={kpis.totalCompleted} />
        <KpiCard label="Projetos Cancelados" value={kpis.totalCancelled} />
        <KpiCard
          label="Taxa de Cancelamento"
          value={formatPercent(kpis.cancellationRate)}
        />
        <KpiCard
          label="Equipe Média Ativa"
          value={kpis.averageTeamSize.toFixed(1)}
        />
      </div>

      <div className="chart-card">
        <h2 className="chart-title">Volume Mensal de Projetos</h2>
        <ResponsiveContainer width="100%" height={320}>
            <LineChart data={volumeSeries}>
  <CartesianGrid
    strokeDasharray="3 3"
    stroke="#e2e8f0"
    strokeOpacity={0.8}
  />
  <XAxis dataKey="month" tick={{ fontSize: 11 }} interval={5} />
  <YAxis tick={{ fontSize: 11 }} />

    <Tooltip content={<VolumeTooltip />} />
    <Legend content={<VolumeLegend />} />

<Line
  type="monotone"
  dataKey="Iniciados"
  name="Iniciados"
  stroke="#155e75"
  strokeWidth={2}
  dot={{ r: 1.5, fill: '#155e75' }}
  activeDot={{ r: 4 }}
/>

<Line
  type="monotone"
  dataKey="Concluídos"
  name="Concluídos"
  stroke="#16803c"
  strokeWidth={2}
  dot={{ r: 1.5, fill: '#16803c' }}
  activeDot={{ r: 4 }}
/>

<Line
  type="monotone"
  dataKey="Cancelados"
  name="Cancelados"
  stroke="#c62828"
  strokeWidth={2.2}
  strokeDasharray="7 5"
  dot={{ r: 2.5, fill: '#c62828' }}
  activeDot={{ r: 4.5 }}
/>
</LineChart>
          
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h2 className="chart-title">
          Composição do Portfólio ao Longo do Tempo
        </h2>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={compositionSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} interval={5} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="Em Execução"
              stackId="1"
              stroke="var(--color-primary)"
              fill="var(--color-primary)"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="Planejados"
              stackId="1"
              stroke="var(--color-accent)"
              fill="var(--color-accent)"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="Pipeline"
              stackId="1"
              stroke="var(--color-text-soft)"
              fill="var(--color-text-soft)"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="Histórico"
              stackId="1"
              stroke="var(--color-text-muted)"
              fill="var(--color-text-muted)"
              fillOpacity={0.4}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h2 className="chart-title">Orçamento vs. Custo Real</h2>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={budgetSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} interval={5} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Bar
              dataKey="Orçamento Ativo"
              fill="var(--color-primary-soft)"
              barSize={12}
            />
            <Line
              type="monotone"
              dataKey="Custo Real Ativo"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
            />
            <Bar
              dataKey="Orçamento Concluído"
              fill="var(--color-accent-soft)"
              barSize={12}
            />
            <Line
              type="monotone"
              dataKey="Custo Real Concluído"
              stroke="var(--color-accent)"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h2 className="chart-title">Tamanho Médio de Equipe Ativa</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={teamSizeSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} interval={5} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="Equipe Média"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="risk-table-card">
        <h2 className="chart-title">Resumo Anual</h2>
        <p className="chart-subtitle">Consolidado de projetos e equipe por ano.</p>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ano</th>
                <th>Iniciados</th>
                <th>Concluídos</th>
                <th>Cancelados</th>
                <th>Equipe Média</th>
              </tr>
            </thead>
            <tbody>
              {yearlySummary.map((row) => (
                <tr key={row.year}>
                  <td>{row.year}</td>
                  <td>{row.started}</td>
                  <td>{row.completed}</td>
                  <td>{row.cancelled}</td>
                  <td>{row.averageTeamSize.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Dicionario() {
  const projectFields = [
    {
      name: 'project_id',
      type: 'Identificador',
      description:
        'Código único utilizado para identificar cada projeto individualmente ao longo de todo o seu ciclo de vida.',
    },
    {
      name: 'project_name',
      type: 'Texto',
      description:
        'Nome ou título do projeto, utilizado para facilitar sua identificação e análise pelas equipes de gestão.',
    },
    {
      name: 'client_id',
      type: 'Identificador',
      description:
        'Código do cliente associado ao projeto. Permite analisar concentração de projetos, relacionamento e distribuição da carteira.',
    },
    {
      name: 'project_manager',
      type: 'Texto',
      description:
        'Nome ou identificador do gerente responsável pelo planejamento, acompanhamento e entrega do projeto.',
    },
    {
      name: 'business_unit',
      type: 'Categoria',
      description:
        'Área de negócio responsável ou beneficiária do projeto. É utilizada para comparar desempenho, volume e riscos entre unidades.',
    },
    {
      name: 'project_type',
      type: 'Categoria',
      description:
        'Classificação do projeto de acordo com sua natureza ou finalidade de negócio.',
    },
    {
      name: 'priority',
      type: 'Categoria',
      description:
        'Nível de prioridade atribuído ao projeto, indicando sua importância relativa para o portfólio e para os objetivos estratégicos.',
    },
    {
      name: 'complexity',
      type: 'Categoria',
      description:
        'Classificação da complexidade do projeto, considerando o esforço de execução, as dependências e os desafios envolvidos.',
    },
    {
      name: 'planned_start_date',
      type: 'Data',
      description:
        'Data originalmente planejada para o início do projeto, utilizada como referência para medir atrasos ou antecipações.',
    },
    {
      name: 'planned_end_date',
      type: 'Data',
      description:
        'Data originalmente prevista para a conclusão do projeto, utilizada na avaliação do cumprimento do cronograma.',
    },
    {
      name: 'actual_start_date',
      type: 'Data',
      description:
        'Data efetiva em que o projeto foi iniciado. A comparação com a data planejada indica a variação de início.',
    },
    {
      name: 'actual_end_date',
      type: 'Data',
      description:
        'Data efetiva de encerramento do projeto. É utilizada para calcular a duração real e avaliar a conclusão dentro do prazo.',
    },
    {
      name: 'planned_budget',
      type: 'Moeda',
      description:
        'Orçamento financeiro aprovado ou estimado para a execução do projeto. Serve como referência para comparar o custo real.',
    },
    {
      name: 'actual_cost',
      type: 'Moeda',
      description:
        'Custo efetivamente incorrido pelo projeto. Sua comparação com o orçamento permite identificar desvios financeiros.',
    },
    {
      name: 'planned_hours',
      type: 'Número',
      description:
        'Quantidade de horas de trabalho estimada para concluir o projeto conforme o planejamento original.',
    },
    {
      name: 'actual_hours',
      type: 'Número',
      description:
        'Quantidade de horas efetivamente consumida na execução do projeto. Permite avaliar desvios de esforço.',
    },
    {
      name: 'team_size',
      type: 'Número',
      description:
        'Quantidade de pessoas alocadas ou envolvidas diretamente na execução do projeto.',
    },
    {
      name: 'project_status',
      type: 'Categoria',
      description:
        'Situação atual do projeto, como planejado, em execução, concluído ou cancelado.',
    },
    {
      name: 'final_quality_score',
      type: 'Pontuação',
      description:
        'Avaliação final da qualidade da entrega do projeto, utilizada para acompanhar o padrão de resultados obtidos.',
    },
    {
      name: 'client_satisfaction_score',
      type: 'Pontuação',
      description:
        'Nota atribuída pelo cliente para representar sua percepção sobre a entrega e o resultado do projeto.',
    },
    {
      name: 'planned_duration_days',
      type: 'Número',
      description:
        'Duração planejada do projeto em dias corridos, calculada entre as datas previstas de início e término.',
    },
    {
      name: 'actual_duration_days',
      type: 'Número',
      description:
        'Duração real do projeto em dias corridos, calculada com base nas datas efetivas de início e término.',
    },
    {
      name: 'schedule_variance_days',
      type: 'Número',
      description:
        'Variação total do cronograma em dias. Valores positivos normalmente indicam atraso em relação ao planejamento.',
    },
    {
      name: 'start_variance_days',
      type: 'Número',
      description:
        'Diferença, em dias, entre a data real e a data planejada de início do projeto.',
    },
    {
      name: 'end_variance_days',
      type: 'Número',
      description:
        'Diferença, em dias, entre a data real e a data planejada de término do projeto.',
    },
    {
      name: 'cost_variance',
      type: 'Moeda',
      description:
        'Diferença financeira entre o orçamento planejado e o custo real do projeto.',
    },
    {
      name: 'cost_variance_pct',
      type: 'Percentual',
      description:
        'Variação percentual do custo em relação ao orçamento planejado. Facilita a comparação entre projetos de diferentes tamanhos.',
    },
    {
      name: 'hours_variance',
      type: 'Número',
      description:
        'Diferença entre as horas efetivamente utilizadas e as horas planejadas para o projeto.',
    },
    {
      name: 'hours_variance_pct',
      type: 'Percentual',
      description:
        'Variação percentual das horas consumidas em relação ao esforço originalmente planejado.',
    },
    {
      name: 'is_completed',
      type: 'Booleano',
      description:
        'Indicador que informa se o projeto já foi concluído.',
    },
    {
      name: 'is_cancelled',
      type: 'Booleano',
      description:
        'Indicador que informa se o projeto foi cancelado antes de sua conclusão.',
    },
    {
      name: 'is_active_current',
      type: 'Booleano',
      description:
        'Indicador que identifica projetos atualmente ativos ou em execução no portfólio.',
    },
    {
      name: 'is_pipeline',
      type: 'Booleano',
      description:
        'Indicador que identifica projetos ainda em pipeline, ou seja, previstos ou planejados, mas não iniciados.',
    },
    {
      name: 'schedule_risk_flag',
      type: 'Booleano',
      description:
        'Sinalizador que indica se o projeto apresenta risco relevante relacionado ao cumprimento do cronograma.',
    },
    {
      name: 'cost_risk_flag',
      type: 'Booleano',
      description:
        'Sinalizador que indica se o projeto apresenta risco relevante de ultrapassar o orçamento planejado.',
    },
    {
      name: 'completed_on_time',
      type: 'Booleano',
      description:
        'Indicador que informa se um projeto concluído foi entregue dentro do prazo planejado.',
    },
    {
      name: 'completed_within_budget',
      type: 'Booleano',
      description:
        'Indicador que informa se um projeto concluído foi entregue sem ultrapassar o orçamento aprovado.',
    },
    {
      name: 'quality_band',
      type: 'Categoria',
      description:
        'Faixa qualitativa derivada da pontuação final de qualidade, utilizada para facilitar a interpretação dos resultados.',
    },
    {
      name: 'start_year',
      type: 'Número',
      description:
        'Ano de início planejado ou registrado do projeto, utilizado nos agrupamentos e análises anuais.',
    },
    {
      name: 'start_month',
      type: 'Número',
      description:
        'Número do mês de início do projeto, utilizado para construir as séries temporais mensais.',
    },
    {
      name: 'start_month_name',
      type: 'Texto',
      description:
        'Nome abreviado do mês de início do projeto, utilizado para facilitar a apresentação visual dos períodos.',
    },
  ]

      const riskFields = [
    {
      name: 'predicted_schedule_risk_proba',
      type: 'Probabilidade',
      description:
        'Probabilidade estimada pelo modelo de Machine Learning de que o projeto apresente risco relevante de atraso no cronograma.',
    },
    {
      name: 'predicted_cost_risk_proba',
      type: 'Probabilidade',
      description:
        'Probabilidade estimada pelo modelo de que o projeto ultrapasse o orçamento planejado, apoiando a priorização de análises e ações preventivas.',
    },
    {
      name: 'predicted_cost_variance_pct',
      type: 'Percentual',
      description:
        'Estimativa da variação percentual de custo esperada para o projeto em relação ao orçamento planejado.',
    },
    {
      name: 'schedule_risk_level',
      type: 'Categoria',
      description:
        'Classificação qualitativa do risco de prazo, normalmente agrupada em níveis como baixo, médio ou alto.',
    },
    {
      name: 'cost_risk_level',
      type: 'Categoria',
      description:
        'Classificação qualitativa do risco financeiro do projeto, indicando o nível esperado de exposição orçamentária.',
    },
    {
      name: 'predicted_cost_variance_band',
      type: 'Categoria',
      description:
        'Faixa de variação de custo prevista pelo modelo, utilizada para transformar uma estimativa numérica em uma categoria de interpretação gerencial.',
    },
    {
      name: 'risk_cluster',
      type: 'Categoria',
      description:
        'Identificador do agrupamento de risco ao qual o projeto pertence, com base em características semelhantes de prazo, custo e execução.',
    },
    {
      name: 'cluster_profile',
      type: 'Texto',
      description:
        'Descrição interpretativa do perfil de risco associado ao agrupamento do projeto, facilitando a análise de padrões recorrentes no portfólio.',
    },
  ]

    const monthlyFields = [
    {
      name: 'month_start',
      type: 'Data',
      description:
        'Primeiro dia do mês de referência. É utilizado para ordenar cronologicamente os registros e construir as séries temporais do dashboard.',
    },
    {
      name: 'month_end',
      type: 'Data',
      description:
        'Último dia do mês de referência. Permite delimitar o período analisado em cada registro mensal.',
    },
    {
      name: 'year',
      type: 'Número',
      description:
        'Ano de referência do registro mensal, utilizado para agrupamentos, filtros e comparações anuais do portfólio.',
    },
    {
      name: 'month',
      type: 'Número',
      description:
        'Número do mês de referência, de 1 a 12. É utilizado em conjunto com o ano para ordenar os períodos corretamente.',
    },
    {
      name: 'month_name',
      type: 'Texto',
      description:
        'Nome ou abreviação do mês apresentado nos gráficos e tabelas para facilitar a leitura dos períodos.',
    },
    {
      name: 'projects_starting',
      type: 'Número',
      description:
        'Quantidade de projetos que tiveram início no mês de referência. Representa a entrada efetiva de novos projetos em execução.',
    },
    {
      name: 'projects_planned_ending',
      type: 'Número',
      description:
        'Quantidade de projetos cuja conclusão estava planejada para o mês de referência, independentemente de terem sido concluídos ou não.',
    },
    {
      name: 'projects_completed',
      type: 'Número',
      description:
        'Quantidade de projetos efetivamente concluídos durante o mês de referência.',
    },
    {
      name: 'projects_cancelled',
      type: 'Número',
      description:
        'Quantidade de projetos cancelados durante o mês de referência. Esse indicador ajuda a acompanhar perdas ou mudanças relevantes no portfólio.',
    },
    {
      name: 'active_planned_projects',
      type: 'Número',
      description:
        'Quantidade de projetos planejados e ainda não concluídos ou cancelados, conforme a posição do portfólio no período analisado.',
    },
    {
      name: 'active_current_projects',
      type: 'Número',
      description:
        'Quantidade de projetos atualmente em execução no mês de referência.',
    },
    {
      name: 'active_historical_projects',
      type: 'Número',
      description:
        'Quantidade de projetos que permaneciam ativos segundo o histórico do portfólio naquele período.',
    },
    {
      name: 'pipeline_projects',
      type: 'Número',
      description:
        'Quantidade de projetos em pipeline, ainda não iniciados, mas previstos ou planejados para execução futura.',
    },
    {
      name: 'active_planned_budget',
      type: 'Moeda',
      description:
        'Soma dos orçamentos planejados dos projetos ativos considerados no período de referência.',
    },
    {
      name: 'active_actual_cost',
      type: 'Moeda',
      description:
        'Soma dos custos reais registrados para os projetos ativos no período de referência.',
    },
    {
      name: 'completed_budget',
      type: 'Moeda',
      description:
        'Soma dos orçamentos planejados dos projetos concluídos no mês de referência.',
    },
    {
      name: 'completed_actual_cost',
      type: 'Moeda',
      description:
        'Soma dos custos reais dos projetos concluídos no mês de referência. É utilizada na comparação entre orçamento e custo efetivo das entregas.',
    },
    {
      name: 'average_team_size_active',
      type: 'Número',
      description:
        'Tamanho médio das equipes alocadas aos projetos ativos no período. Ajuda a acompanhar a demanda média de capacidade operacional.',
    },
  ]

  return (
    <div className="page">
      <PageHeader
        title="Dicionário de Dados"
        subtitle="Definição das métricas, colunas e metodologia utilizadas neste dashboard."
      />

      <div className="chart-card">
        <h2 className="chart-title">Como interpretar os dados</h2>
        <p className="chart-subtitle">
          Esta página documenta os principais campos utilizados na análise do
          portfólio de projetos, incluindo sua finalidade de negócio e o tipo
          de informação armazenada.
        </p>

        <p className="chart-subtitle">
          O arquivo <strong>project_analytics.csv</strong> possui granularidade
          de projeto: cada linha representa um projeto individual. Os campos
          combinam informações cadastrais, planejamento, execução, custos,
          esforço, qualidade e status.
        </p>

        <p className="chart-subtitle">
          As variações de prazo, custo e horas são calculadas comparando os
          valores planejados com os resultados efetivamente observados.
          Indicadores booleanos são utilizados para alimentar os KPIs, filtros,
          alertas e gráficos do dashboard.
        </p>
      </div>

      <div className="risk-table-card">
        <h2 className="chart-title">Dados principais dos projetos</h2>
        <p className="chart-subtitle">
          Campos disponíveis no arquivo <strong>project_analytics.csv</strong>.
        </p>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Campo</th>
                <th>Tipo</th>
                <th>Descrição de negócio</th>
              </tr>
            </thead>

            <tbody>
              {projectFields.map((field) => (
                <tr key={field.name}>
                  <td>
                    <strong>{field.name}</strong>
                  </td>
                  <td>{field.type}</td>
                  <td
                    style={{
                      whiteSpace: 'normal',
                      minWidth: '420px',
                      lineHeight: 1.5,
                    }}
                  >
                    {field.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="risk-table-card">
        <h2 className="chart-title">Indicadores de risco preditivo</h2>

        <p className="chart-subtitle">
          Campos adicionais disponíveis no arquivo{' '}
          <strong>project_risk_scores.csv</strong>. Esses indicadores
          complementam os dados históricos dos projetos com estimativas geradas
          por modelos de Machine Learning.
        </p>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Campo</th>
                <th>Tipo</th>
                <th>Descrição de negócio</th>
              </tr>
            </thead>

            <tbody>
              {riskFields.map((field) => (
                <tr key={field.name}>
                  <td>
                    <strong>{field.name}</strong>
                  </td>
                  <td>{field.type}</td>
                  <td
                    style={{
                      whiteSpace: 'normal',
                      minWidth: '420px',
                      lineHeight: 1.5,
                    }}
                  >
                    {field.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AppFooter() {
  return (
    <footer style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-soft)', fontSize: '12px' }}>
      Project Portfolio Management Analytics
    </footer>
  )
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="app-shell">
        <Topbar />
        <Routes>
          <Route path="/" element={<VisaoExecutiva />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/riscos" element={<Riscos />} />
          <Route path="/desempenho" element={<Desempenho />} />
          <Route path="/tendencias" element={<Tendencias />} />
          <Route path="/dicionario" element={<Dicionario />} />
        </Routes>
        <AppFooter />
      </div>
    </BrowserRouter>
  )
}

export default App
