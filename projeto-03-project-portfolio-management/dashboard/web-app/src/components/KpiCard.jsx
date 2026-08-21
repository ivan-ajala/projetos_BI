
function KpiCard({ label, value, tone = 'primary' }) {
  const toneClass = {
    primary: '',
    accent: 'kpi-card-accent',
    success: 'kpi-card-success',
    danger: 'kpi-card-danger',
  }[tone]

  return (
    <div className={`kpi-card ${toneClass}`}>
      <p className="kpi-label">{label}</p>
      <p className="kpi-value">{value}</p>
    </div>
  )
}

export default KpiCard
