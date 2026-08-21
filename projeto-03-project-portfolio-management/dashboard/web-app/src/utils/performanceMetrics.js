function average(values) {
  const validValues = values.filter(
    (value) =>
      value !== null &&
      value !== undefined &&
      Number.isFinite(Number(value))
  )

  if (validValues.length === 0) return 0

  return (
    validValues.reduce((sum, value) => sum + Number(value), 0) /
    validValues.length
  )
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

function toBoolean(value) {
  if (typeof value === 'string') {
    return value.trim().toLowerCase() === 'true' || value.trim() === '1'
  }
  return value === true || value === 1
}

function normalizeScore(value, scale = 10) {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) return 0

  return clamp((numericValue / scale) * 100)
}

function schedulePerformanceScore(scheduleVarianceDays) {
  const variance = Math.abs(Number(scheduleVarianceDays))

  if (!Number.isFinite(variance)) return 50

  return clamp(100 - (variance / 30) * 100)
}

function costPerformanceScore(costVariancePct) {
  const variance = Math.abs(Number(costVariancePct))

  if (!Number.isFinite(variance)) return 50

  return clamp(100 - (variance / 30) * 100)
}

export function calculateProjectHealth(row) {
  const scheduleScore = schedulePerformanceScore(row.schedule_variance_days)
  const costScore = costPerformanceScore(row.cost_variance_pct)
  const qualityScore = normalizeScore(row.final_quality_score)
  const satisfactionScore = normalizeScore(row.client_satisfaction_score)

  const healthScore =
    scheduleScore * 0.25 +
    costScore * 0.25 +
    qualityScore * 0.25 +
    satisfactionScore * 0.25

  return {
    projectId: row.project_id,
    projectName: row.project_name,
    businessUnit: row.business_unit,
    healthScore: Number(healthScore.toFixed(1)),
    scheduleScore: Number(scheduleScore.toFixed(1)),
    costScore: Number(costScore.toFixed(1)),
    qualityScore: Number(qualityScore.toFixed(1)),
    satisfactionScore: Number(satisfactionScore.toFixed(1)),
  }
}

export function getHealthBand(score) {
  const numericScore = Number(score)

  if (numericScore >= 80) return 'Saúde alta'
  if (numericScore >= 60) return 'Saúde moderada'
  return 'Atenção necessária'
}

export function buildProjectHealthSummary(analytics) {
  const evaluatedProjects = analytics
    .filter((row) => toBoolean(row.is_completed))
    .map(calculateProjectHealth)

  const averageHealth = average(
    evaluatedProjects.map((project) => project.healthScore)
  )

  const healthDistribution = [
    {
      name: 'Saúde alta',
      value: evaluatedProjects.filter((project) => project.healthScore >= 80)
        .length,
    },
    {
      name: 'Saúde moderada',
      value: evaluatedProjects.filter(
        (project) => project.healthScore >= 60 && project.healthScore < 80
      ).length,
    },
    {
      name: 'Atenção necessária',
      value: evaluatedProjects.filter((project) => project.healthScore < 60)
        .length,
    },
  ]

  return {
    evaluatedProjects,
    averageHealth: Number(averageHealth.toFixed(1)),
    healthDistribution,
  }
}

export function buildPerformanceKpis(analytics) {
  const completed = analytics.filter((row) => toBoolean(row.is_completed))

  const onTimeCount = completed.filter((row) =>
    toBoolean(row.completed_on_time)
  ).length

  const withinBudgetCount = completed.filter((row) =>
    toBoolean(row.completed_within_budget)
  ).length

  return {
    completedProjects: completed.length,
    onTimeRate:
      completed.length > 0 ? (onTimeCount / completed.length) * 100 : 0,
    withinBudgetRate:
      completed.length > 0
        ? (withinBudgetCount / completed.length) * 100
        : 0,
    averageQuality: average(
      completed.map((row) => row.final_quality_score)
    ),
    averageSatisfaction: average(
      completed.map((row) => row.client_satisfaction_score)
    ),
    averageScheduleVariance: average(
      completed.map((row) => row.schedule_variance_days)
    ),
    averageCostVariance: average(
      completed.map((row) => row.cost_variance_pct)
    ),
  }
}

export function buildQualityDistribution(analytics) {
  const counts = {}

  analytics
    .filter((row) => toBoolean(row.is_completed))
    .forEach((row) => {
      const band = row.quality_band || 'Não informado'
      counts[band] = (counts[band] || 0) + 1
    })

  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
  }))
}

export function buildBusinessUnitPerformance(analytics) {
  const groups = {}

  analytics
    .filter((row) => toBoolean(row.is_completed))
    .forEach((row) => {
      const unit = row.business_unit || 'Não informado'

      if (!groups[unit]) {
        groups[unit] = {
          unit,
          projects: 0,
          onTime: 0,
          withinBudget: 0,
          qualityScores: [],
          satisfactionScores: [],
        }
      }

      groups[unit].projects += 1

      if (toBoolean(row.completed_on_time)) {
        groups[unit].onTime += 1
      }

      if (toBoolean(row.completed_within_budget)) {
        groups[unit].withinBudget += 1
      }

      if (Number.isFinite(Number(row.final_quality_score))) {
        groups[unit].qualityScores.push(Number(row.final_quality_score))
      }

      if (Number.isFinite(Number(row.client_satisfaction_score))) {
        groups[unit].satisfactionScores.push(
          Number(row.client_satisfaction_score)
        )
      }
    })

  return Object.values(groups)
    .map((group) => ({
      unit: group.unit,
      projects: group.projects,
      onTimeRate: (group.onTime / group.projects) * 100,
      withinBudgetRate: (group.withinBudget / group.projects) * 100,
      averageQuality: average(group.qualityScores),
      averageSatisfaction: average(group.satisfactionScores),
    }))
    .sort((a, b) => b.projects - a.projects)
}

export function buildBusinessUnitRadarData(analytics) {
  return buildBusinessUnitPerformance(analytics).map((unit) => ({
    unit: unit.unit,
    projetos: unit.projects,
    'Prazo (%)': Number(unit.onTimeRate.toFixed(1)),
    'Custo (%)': Number(unit.withinBudgetRate.toFixed(1)),
    'Qualidade (%)': Number((unit.averageQuality * 10).toFixed(1)),
    'Satisfação (%)': Number((unit.averageSatisfaction * 10).toFixed(1)),
  }))
}

export function buildVarianceDistribution(analytics) {
  const ranges = [
    { name: 'Dentro do orçamento', min: -Infinity, max: 0 },
    { name: 'Estouro de até 10%', min: 0.0001, max: 10 },
    { name: 'Estouro de 10% a 25%', min: 10, max: 25 },
    { name: 'Estouro acima de 25%', min: 25, max: Infinity },
  ]

  return ranges.map((range) => ({
    name: range.name,
    value: analytics.filter((row) => {
      if (!toBoolean(row.is_completed)) return false

      const variance = Number(row.cost_variance_pct)

      if (!Number.isFinite(variance)) return false

      return variance >= range.min && variance < range.max
    }).length,
  }))
}
