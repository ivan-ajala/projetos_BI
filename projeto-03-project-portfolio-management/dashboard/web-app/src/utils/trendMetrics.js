function formatMonthLabel(row) {
  return `${row.month_name?.slice(0, 3)}/${String(row.year).slice(2)}`
}

function toNumber(value) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : 0
}

export function buildTrendKpis(monthly) {
  const totalStarting = monthly.reduce(
    (sum, row) => sum + toNumber(row.projects_starting),
    0
  )
  const totalCompleted = monthly.reduce(
    (sum, row) => sum + toNumber(row.projects_completed),
    0
  )
  const totalCancelled = monthly.reduce(
    (sum, row) => sum + toNumber(row.projects_cancelled),
    0
  )

  const teamSizeValues = monthly
    .map((row) => toNumber(row.average_team_size_active))
    .filter((value) => value > 0)

  const averageTeamSize =
    teamSizeValues.length > 0
      ? teamSizeValues.reduce((sum, value) => sum + value, 0) /
        teamSizeValues.length
      : 0

  const totalProjectsFlow = totalStarting + totalCancelled

  return {
    totalStarting,
    totalCompleted,
    totalCancelled,
    cancellationRate:
      totalProjectsFlow > 0 ? (totalCancelled / totalProjectsFlow) * 100 : 0,
    averageTeamSize,
  }
}

export function buildVolumeSeries(monthly) {
  return monthly.map((row) => ({
    month: formatMonthLabel(row),
    Iniciados: toNumber(row.projects_starting),
    Concluídos: toNumber(row.projects_completed),
    Cancelados: toNumber(row.projects_cancelled),
  }))
}

export function buildPortfolioCompositionSeries(monthly) {
  return monthly.map((row) => ({
    month: formatMonthLabel(row),
    'Em Execução': toNumber(row.active_current_projects),
    Planejados: toNumber(row.active_planned_projects),
    Histórico: toNumber(row.active_historical_projects),
    Pipeline: toNumber(row.pipeline_projects),
  }))
}

export function buildBudgetTrendSeries(monthly) {
  return monthly.map((row) => ({
    month: formatMonthLabel(row),
    'Orçamento Ativo': toNumber(row.active_planned_budget),
    'Custo Real Ativo': toNumber(row.active_actual_cost),
    'Orçamento Concluído': toNumber(row.completed_budget),
    'Custo Real Concluído': toNumber(row.completed_actual_cost),
  }))
}

export function buildTeamSizeSeries(monthly) {
  return monthly.map((row) => ({
    month: formatMonthLabel(row),
    'Equipe Média': toNumber(row.average_team_size_active),
  }))
}

export function buildYearlySummary(monthly) {
  const groups = {}

  monthly.forEach((row) => {
    const year = row.year

    if (!groups[year]) {
      groups[year] = {
        year,
        started: 0,
        completed: 0,
        cancelled: 0,
        teamSizeValues: [],
      }
    }

    groups[year].started += toNumber(row.projects_starting)
    groups[year].completed += toNumber(row.projects_completed)
    groups[year].cancelled += toNumber(row.projects_cancelled)

    const teamSize = toNumber(row.average_team_size_active)
    if (teamSize > 0) {
      groups[year].teamSizeValues.push(teamSize)
    }
  })

  return Object.values(groups)
    .map((group) => ({
      year: group.year,
      started: group.started,
      completed: group.completed,
      cancelled: group.cancelled,
      averageTeamSize:
        group.teamSizeValues.length > 0
          ? group.teamSizeValues.reduce((sum, value) => sum + value, 0) /
            group.teamSizeValues.length
          : 0,
    }))
    .sort((a, b) => a.year - b.year)
}
