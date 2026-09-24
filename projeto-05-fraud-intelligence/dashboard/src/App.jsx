import { useMemo, useState } from 'react'

const periods = {
  validation: {
    label: 'Validação', short: 'VALIDAÇÃO', transactions: 191147,
    steps: 'Steps 521–631 · validação',
    metrics: {
      1: { alerts: 83820, precision: 1.4, recall: 100, fp: 82640, tp: 1180, rate: '43,851%' },
      2: { alerts: 3718, precision: 31.7, recall: 100, fp: 2538, tp: 1180, rate: '1,945%' },
      3: { alerts: 349, precision: 100, recall: 29.6, fp: 0, tp: 349, rate: '0,183%' },
    },
    chart: [
      { threshold: 1, precision: 1.4, recall: 100 },
      { threshold: 2, precision: 31.7, recall: 100 },
      { threshold: 3, precision: 100, recall: 29.6 },
    ],
  },
  test: {
    label: 'Teste exploratório', short: 'TESTE EXPLORATÓRIO', transactions: 89466,
    steps: 'Steps 632–743 · teste cronológico exploratório',
    metrics: {
      1: { alerts: 39759, precision: 3.1, recall: 100, fp: 38507, tp: 1252, fn: 0, rate: '44,440%' },
      2: { alerts: 2790, precision: 44.8, recall: 99.9, fp: 1539, tp: 1251, fn: 1, rate: '3,119%' },
      3: { alerts: 376, precision: 100, recall: 30.0, fp: 0, tp: 376, fn: 876, rate: '0,420%' },
    },
    chart: [
      { threshold: 1, precision: 3.1, recall: 100 },
      { threshold: 2, precision: 44.8, recall: 99.9 },
      { threshold: 3, precision: 100, recall: 30.0 },
    ],
  },
}

const formatNumber = (value) => new Intl.NumberFormat('pt-BR').format(value)
const formatPct = (value) => `${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
const navItems = [
  ['overview', '◫', 'Resumo executivo'],
  ['performance', '⌁', 'Desempenho do baseline'],
  ['operations', '▤', 'Fluxo de triagem'],
  ['governance', '◇', 'Indicadores & limites'],
]

function SectionTitle({ title, subtitle, pill }) {
  return <div className="panel-title"><div><h2>{title}</h2><p>{subtitle}</p></div>{pill && <span className="period-pill">{pill}</span>}</div>
}

function PerformanceChart({ period }) {
  const data = periods[period].chart
  const width = 600, height = 220, left = 45, right = 15, top = 12, bottom = 32
  const plotHeight = height - top - bottom
  const plotWidth = width - left - right
  const step = plotWidth / data.length
  const barWidth = Math.min(37, step * 0.24)
  return <div className="chart-wrap"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Comparação entre precisão e recall por limiar">
    {[0, 25, 50, 75, 100].map((v) => {
      const y = top + plotHeight - (v / 100) * plotHeight
      return <g key={v}><line className="axis" x1={left} x2={width - right} y1={y} y2={y} /><text className="axis-label" x={left - 8} y={y + 3} textAnchor="end">{v}%</text></g>
    })}
    {data.map((item, index) => {
      const center = left + step * (index + 0.5)
      return <g key={item.threshold}>
        {[[item.precision, 'bar selected', -barWidth * 0.55, 'Precisão'], [item.recall, 'bar light', barWidth * 0.55, 'Recall']].map(([value, className, offset, label]) => {
          const barHeight = plotHeight * value / 100
          const y = top + plotHeight - barHeight
          return <g key={label}><rect className={className} x={center + offset - barWidth / 2} y={y} width={barWidth} height={Math.max(barHeight, 1)} rx="3"><title>{`Limiar ${item.threshold} · ${label}: ${formatPct(value)}`}</title></rect><text className="chart-tip" x={center + offset} y={Math.max(y - 5, 9)} textAnchor="middle">{formatPct(value)}</text></g>
        })}
        <text className="axis-label" x={center} y={height - 8} textAnchor="middle">Limiar {item.threshold}</text>
      </g>
    })}
  </svg></div>
}

function Donut({ precision }) {
  return <div className="donut" style={{ '--dash': `${precision} 100` }} aria-label={`Precisão de ${formatPct(precision)}`}>
    <svg viewBox="0 0 100 100" aria-hidden="true"><circle className="track" cx="50" cy="50" r="40" /><circle className="progress" cx="50" cy="50" r="40" pathLength="100" /></svg>
    <div className="donut-center"><b>{formatPct(precision)}</b><span>precisão</span></div>
  </div>
}

function App() {
  const [period, setPeriod] = useState('validation')
  const [threshold, setThreshold] = useState(2)
  const periodData = periods[period]
  const selectedThreshold = threshold
  const metric = useMemo(() => periodData.metrics[selectedThreshold], [periodData, selectedThreshold])

  const changePeriod = (next) => {
    setPeriod(next)
  }

  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><img className="brand-logo" src={`${import.meta.env.BASE_URL}ia-datia-logo.png`} alt="datIA" /><div className="brand-copy"><b>FRAUD INTELLIGENCE</b><small>Risk monitoring · portfolio case</small></div></div>
      <div className="navlabel">Visão de monitoramento</div>
      <nav className="nav" aria-label="Navegação do painel">
        {navItems.map(([id, icon, label], index) => <a className={index === 0 ? 'active' : ''} href={`#${id}`} key={id}><span className="ico">{icon}</span>{label}</a>)}
      </nav>
      <div className="side-note"><strong>AMBIENTE DEMONSTRATIVO</strong>PaySim é uma base sintética. Esta tela ilustra monitoramento analítico; não é ferramenta operacional nem acompanha eventos em tempo real.</div>
    </aside>

    <main className="main">
      <div className="topline"><div className="crumb"><span>Portfólio</span><span> / </span><span>Projeto 05</span><span> / </span><b>Monitoramento</b></div><div className="top-actions"><span className="badge">Estudo de caso simulado</span><div className="avatar">IA</div></div></div>
      <section id="overview">
        <div className="heading"><div><h1>Inteligência e prevenção a fraudes</h1><p>Visão executiva · baseline de regras explicáveis · leitura por período cronológico</p></div><span className="dataset-tag">DADOS SINTÉTICOS · PAYSIM · BACKTEST EXPLORATÓRIO</span></div>
        <div className="warning"><span className="mark">!</span><div><strong>Interpretação com cautela.</strong> Indicadores descrevem o PaySim e uma avaliação retrospectiva já explorada. Não representam desempenho esperado em produção, fraude real, perda financeira ou perdas evitadas.</div></div>
        <div className="controlbar"><label htmlFor="threshold">Escolha o recorte para consultar as métricas</label><div className="select-wrap"><div className="segmented" role="group" aria-label="Período"><button className={period === 'validation' ? 'selected' : ''} onClick={() => changePeriod('validation')}>Validação</button><button className={period === 'test' ? 'selected' : ''} onClick={() => changePeriod('test')}>Teste exploratório</button></div><label htmlFor="threshold">Limiar</label><select id="threshold" value={selectedThreshold} onChange={(event) => setThreshold(Number(event.target.value))}><option value={1}>1 — máxima cobertura</option><option value={2}>2 — referência principal</option><option value={3}>3 — menor fila</option></select></div></div>
        <div className="grid kpis">
          <article className="card kpi"><div className="kpi-head"><span>Transações no período</span><span className="kpi-icon">▦</span></div><div className="value">{formatNumber(periodData.transactions)}</div><div className="sub">{periodData.steps}</div></article>
          <article className="card kpi"><div className="kpi-head"><span>Alertas gerados</span><span className="kpi-icon">⌑</span></div><div className="value">{formatNumber(metric.alerts)}</div><div className="sub"><span className="mini-dot" /> <strong>{metric.rate}</strong> das transações · limiar {selectedThreshold}</div></article>
          <article className="card kpi"><div className="kpi-head"><span>Precisão dos alertas</span><span className="kpi-icon">◎</span></div><div className="value">{formatPct(metric.precision)}</div><div className="sub">Proporção de alertas com fraude rotulada</div></article>
          <article className="card kpi"><div className="kpi-head"><span>Recall</span><span className="kpi-icon">↗</span></div><div className="value">{formatPct(metric.recall)}</div><div className="sub">Fraudes rotuladas capturadas neste recorte</div></article>
        </div>
      </section>

      <section className="grid panel-grid">
        <article className="card panel" id="performance"><SectionTitle title="Precisão × cobertura por limiar" subtitle={`${periodData.label}: o trade-off entre alertar mais e priorizar casos com maior concentração de rótulos.`} pill={periodData.short} /><PerformanceChart period={period} /><div className="legend"><span><i />Precisão</span><span><i className="light" />Recall</span></div></article>
        <article className="card panel"><SectionTitle title="Composição da fila de alertas" subtitle={period === 'validation' ? 'Estimativa pelo rótulo retrospectivo · não observável ao analista' : 'Teste cronológico · rótulos conhecidos no backtest'} pill={`LIMIAR ${selectedThreshold}`} /><div className="donut-area"><Donut precision={metric.precision} /><div className="donut-legend"><div className="legend-row"><span><i className="key green" />Fraudes rotuladas</span><b>{formatNumber(metric.tp)}</b></div><div className="legend-row"><span><i className="key red" />Falsos positivos</span><b>{formatNumber(metric.fp)}</b></div><div className="legend-row"><span>Total de alertas</span><b>{formatNumber(metric.alerts)}</b></div></div></div><div className="note-box">“Falso positivo” é calculado retrospectivamente comparando alerta e rótulo do PaySim; não equivale a decisão de analista.</div></article>
      </section>

      <section className="grid bottom-grid">
        <article className="card panel"><SectionTitle title="Comparação dos limiares" subtitle="Resultados observados na validação; seleção do limiar 2 é provisória e ligada à hipótese de triagem." pill="BASELINE · 0–3 SINAIS" /><div className="table-wrap"><table className="metrics-table"><thead><tr><th>Limiar</th><th>Alertas</th><th>Taxa de alertas</th><th>Precisão</th><th>Recall</th><th>Falsos positivos</th></tr></thead><tbody>{[1, 2, 3].map((value) => { const row = periods.validation.metrics[value]; return <tr className={period === 'validation' && selectedThreshold === value ? 'focus' : ''} key={value}><td>{value}{value === 2 && <span className="selected-label">REFERÊNCIA</span>}</td><td>{formatNumber(row.alerts)}</td><td>{row.rate}</td><td>{formatPct(row.precision)}</td><td>{formatPct(row.recall)}</td><td>{formatNumber(row.fp)}</td></tr> })}</tbody></table></div><div className="note-box">Os valores exibidos nos cartões e na composição da fila acompanham o limiar selecionado para o período. O limiar 2 permanece como referência principal; os limiares 1 e 3 são apresentados para análise de sensibilidade.</div></article>
        <article className="card panel" id="governance"><SectionTitle title="Indicadores de acompanhamento" subtitle="Separar desempenho analítico de eficiência operacional." pill="DICIONÁRIO DE KPIs" /><ul className="kpi-list"><li><span>Precisão · qualidade do alerta</span><b>Disponível no backtest</b></li><li><span>Recall · cobertura de fraudes rotuladas</span><b>Disponível no backtest</b></li><li><span>Taxa de falsos positivos</span><b>Disponível no backtest</b></li><li><span>Tempo até a triagem</span><b className="unavailable">Sem dado operacional</b></li><li><span>Alertas pendentes / SLA</span><b className="unavailable">Sem dado operacional</b></li></ul></article>
      </section>

      <section className="grid bottom-grid" id="operations">
        <article className="card panel"><SectionTitle title="Fluxo proposto de triagem" subtitle="Desenho de processo para uma operação fictícia; estados e encaminhamentos ainda não vêm do PaySim." pill="PROPOSTA · NÃO CONECTADA" /><div className="workflow"><div className="workflow-card"><span className="stepno">01 · SINALIZAR</span><h3>Priorizar transações</h3><p>Registrar score (0–3), regras acionadas e motivo legível. Encaminhar por criticidade.</p><span className="status">Fluxo conceitual</span></div><div className="workflow-card"><span className="stepno">02 · REVISAR</span><h3>Triagem humana</h3><p>Analista verifica contexto, registra decisão e encaminha casos conforme política interna.</p><span className="status">Sem eventos reais</span></div><div className="workflow-card"><span className="stepno">03 · APRENDER</span><h3>Monitorar qualidade</h3><p>Acompanhar fila, SLA, divergências e mudança de distribuição; revisar regras com governança.</p><span className="status">KPIs a instrumentar</span></div></div><div className="note-box"><strong>Fila demonstrativa:</strong> esta etapa mostra o fluxo de trabalho esperado, não uma lista de transações reais. O dataset não inclui status de análise, encaminhamento, SLA ou resultado de investigação.</div></article>
        <article className="card panel"><SectionTitle title="Monitoramento responsável" subtitle="O que observar antes de tratar o baseline como ferramenta de decisão." /><ul className="kpi-list"><li><span>Prevalência entre períodos</span><b>0,095% → 0,617% → 1,399%</b></li><li><span>Taxa de alertas · validação (L2)</span><b>1,945%</b></li><li><span>Taxa de alertas · teste (L2)</span><b>3,119%</b></li><li><span>Decisão recomendada</span><b>Revalidar capacidade de triagem</b></li></ul><div className="note-box">A variação temporal observada sinaliza sensibilidade do baseline à distribuição da base. <strong>Não é evidência de tendência real</strong> fora da simulação.</div></article>
      </section>

      <footer className="footer-note"><span>© 2026 Ivan Ajala · Business Intelligence, Data Analytics & Data Science · estudo de caso simulado · nenhum cliente ou operação real.</span><span>Fonte dos dados: PaySim · <a href="https://www.kaggle.com/datasets/ealaxi/paysim1" target="_blank" rel="noreferrer">página do conjunto no Kaggle</a> · Synthetic Financial Datasets For Fraud Detection</span></footer>
    </main>
  </div>
}

export default App
