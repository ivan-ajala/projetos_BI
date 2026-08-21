export function getRiskLevelClass(level) {
  const normalized = String(level || '').toLowerCase()

  if (normalized === 'alto') return 'risk-high'
  if (normalized === 'moderado' || normalized === 'médio') return 'risk-medium'
  return 'risk-low'
}

export function buildRiskSummary(data) {
  const total = data.length

  const highSchedule = data.filter(
    (row) => String(row.schedule_risk_level).toLowerCase() === 'alto'
  ).length

  const highCost = data.filter(
    (row) => String(row.cost_risk_level).toLowerCase() === 'alto'
  ).length

  const highCombined = data.filter(
    (row) =>
      String(row.schedule_risk_level).toLowerCase() === 'alto' ||
      String(row.cost_risk_level).toLowerCase() === 'alto'
  ).length

  const moderateCombined = data.filter(
    (row) =>
      String(row.schedule_risk_level).toLowerCase() === 'moderado' ||
      String(row.cost_risk_level).toLowerCase() === 'moderado'
  ).length

  return {
    total,
    highSchedule,
    highCost,
    highCombined,
    moderateCombined,
    highCombinedPct: total > 0 ? (highCombined / total) * 100 : 0,
  }
}

export function buildRiskRanking(data) {
  return [...data]
    .map((row) => ({
      ...row,
      combinedRiskScore: Math.max(
        Number(row.predicted_schedule_risk_proba) || 0,
        Number(row.predicted_cost_risk_proba) || 0
      ),
    }))
    .sort((a, b) => b.combinedRiskScore - a.combinedRiskScore)
}

export function getUniqueRiskValues(data, key) {
  return [...new Set(
    data
      .map((row) => row[key])
      .filter((value) => value !== null && value !== undefined && value !== '')
  )].sort()
}
