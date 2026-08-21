
const STATUS_TONE = {
  Completed: 'badge-success',
  'In Progress': 'badge-neutral',
  Cancelled: 'badge-danger',
  Planned: 'badge-warning',
}

function StatusBadge({ status }) {
  const toneClass = STATUS_TONE[status] || 'badge-neutral'
  return <span className={`badge ${toneClass}`}>{status}</span>
}

export default StatusBadge
