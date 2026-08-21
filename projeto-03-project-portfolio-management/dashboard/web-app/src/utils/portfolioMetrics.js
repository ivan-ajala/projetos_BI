export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'R$ 0'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '0%'
  return `${value.toFixed(1)}%`
}

export function buildExecutiveKpis(analytics, risk) {
  const total = analytics.length

  const plannedBudget = analytics.reduce((sum, p) => sum + (p.planned_budget || 0), 0)
  const actualCost = analytics.reduce((sum, p) => sum + (p.actual_cost || 0), 0)

  const activeCount = analytics.filter((p) => p.is_active_current).length
  const completedCount = analytics.filter((p) => p.is_completed).length
  const cancelledCount = analytics.filter((p) => p.is_cancelled).length

  const onTimeCount = analytics.filter((p) => p.completed_on_time).length
  const onTimePct = completedCount > 0 ? (onTimeCount / completedCount) * 100 : 0

  const highScheduleRisk = risk.filter((p) => p.schedule_risk_level === 'Alto').length
  const highCostRisk = risk.filter((p) => p.cost_risk_level === 'Alto').length
  const highRiskTotal = risk.filter(
    (p) => p.schedule_risk_level === 'Alto' || p.cost_risk_level === 'Alto'
  ).length
  const highRiskPct = total > 0 ? (highRiskTotal / total) * 100 : 0

  return {
    total,
    plannedBudget,
    actualCost,
    activeCount,
    completedCount,
    cancelledCount,
    onTimePct,
    highScheduleRisk,
    highCostRisk,
    highRiskTotal,
    highRiskPct,
  }
}

export function buildStatusDistribution(analytics) {
  const counts = {}
  analytics.forEach((p) => {
    const status = p.project_status || 'Não informado'
    counts[status] = (counts[status] || 0) + 1
  })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

export function buildMonthlySeries(monthly) {
  return monthly.map((row) => ({
    month: `${row.month_name?.slice(0, 3)}/${String(row.year).slice(2)}`,
    planejado: row.active_planned_budget || 0,
    realizado: row.active_actual_cost || 0,
    ativos: row.active_current_projects || 0,
  }))
}
