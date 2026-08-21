
import Papa from 'papaparse'
import { useEffect, useState } from 'react'
import { loadCsv } from './loadCsv'

const BASE = import.meta.env.BASE_URL

export function usePortfolioData() {
  const [data, setData] = useState({
    analytics: [],
    risk: [],
    monthly: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true

    async function loadAll() {
      try {
        const [analytics, risk, monthly] = await Promise.all([
          loadCsv(`${BASE}data/project_analytics.csv`),
          loadCsv(`${BASE}data/project_risk_scores.csv`),
          loadCsv(`${BASE}data/monthly_portfolio_snapshot.csv`),
        ])

        if (isMounted) {
          setData({ analytics, risk, monthly, loading: false, error: null })
        }
      } catch (err) {
        if (isMounted) {
          setData((prev) => ({ ...prev, loading: false, error: err.message }))
        }
      }
    }

    loadAll()
    return () => {
      isMounted = false
    }
  }, [])

  return data
}
