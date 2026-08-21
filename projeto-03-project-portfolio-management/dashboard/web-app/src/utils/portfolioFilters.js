
export function getUniqueValues(data, key) {
  const values = new Set()
  data.forEach((row) => {
    if (row[key] !== null && row[key] !== undefined && row[key] !== '') {
      values.add(row[key])
    }
  })
  return Array.from(values).sort()
}

export function applyPortfolioFilters(data, filters) {
  const { status, businessUnit, year, search } = filters

  return data.filter((row) => {
    if (status && row.project_status !== status) return false
    if (businessUnit && row.business_unit !== businessUnit) return false
    if (year && String(row.start_year) !== String(year)) return false

    if (search) {
      const term = search.toLowerCase()
      const name = (row.project_name || '').toLowerCase()
      const manager = (row.project_manager || '').toLowerCase()
      if (!name.includes(term) && !manager.includes(term)) return false
    }

    return true
  })
}
