function StatCard({ title, value, subtitle, rightContent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-text">{value}</p>
          {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        </div>
        {rightContent ? <div>{rightContent}</div> : null}
      </div>
    </div>
  )
}

export default StatCard
