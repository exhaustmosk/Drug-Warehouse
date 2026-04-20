const styleMap = {
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  dark: 'bg-primary text-white border-primary',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  info: 'bg-cyan-100 text-cyan-700 border-cyan-200',
}

function Badge({ children, tone = 'neutral' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styleMap[tone]}`}
    >
      {children}
    </span>
  )
}

export default Badge
