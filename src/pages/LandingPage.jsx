import { createElement } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Building2,
  ClipboardCheck,
  Package,
  Shield,
  ThermometerSnowflake,
  Truck,
} from 'lucide-react'

const features = [
  {
    icon: Package,
    title: 'Inventory & batch control',
    desc: 'Track drug names, batches, quantities, and expiry dates with storage conditions aligned to pharma standards.',
  },
  {
    icon: Building2,
    title: 'Zones & facility oversight',
    desc: 'Model warehouse areas, capacity, and environmental signals so teams know what needs attention first.',
  },
  {
    icon: ClipboardCheck,
    title: 'Operations workflow',
    desc: 'Assign priorities, monitor status, and keep receiving, picking, and compliance tasks visible in one place.',
  },
  {
    icon: Shield,
    title: 'Compliance-ready',
    desc: 'Log checks and generate reports auditors expect—fewer spreadsheets, clearer accountability.',
  },
  {
    icon: ThermometerSnowflake,
    title: 'Cold-chain awareness',
    desc: 'Surface temperature-aligned storage types and thresholds so deviations are caught earlier.',
  },
  {
    icon: Truck,
    title: 'Built for warehouse teams',
    desc: 'A focused daily experience for floor staff plus deeper tools for supervisors and owners.',
  },
]

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-text">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="dw-motion inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/25 dw-fade-up">
              DW
            </span>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-900">DrugWare</p>
              <p className="text-[11px] text-muted leading-none">Warehouse operations</p>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <a
              href="#features"
              className="hidden sm:inline-block text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            >
              Capabilities
            </a>
            <a
              href="#who"
              className="hidden sm:inline-block text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            >
              Who it’s for
            </a>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primaryDark transition-colors"
            >
              Get started
              <ArrowRight size={16} aria-hidden />
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-slate-50/80 to-background">
          <div className="pointer-events-none absolute inset-0 opacity-[0.5]" aria-hidden>
            <div className="dw-motion animate-dw-float hero-shimmer-blobs absolute right-[-5%] top-[-35%] h-[480px] w-[480px] rounded-full bg-primary/15 blur-[100px]" />
            <div className="dw-motion animate-dw-float-delay absolute bottom-[-25%] left-[-10%] h-[420px] w-[420px] rounded-full bg-emerald-200/35 blur-[90px]" />
            <div className="dw-motion animate-dw-float absolute left-[20%] top-[38%] h-36 w-36 rounded-full bg-cyan-200/30 blur-3xl" />
          </div>
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
            aria-hidden
          />

          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <p
                className="dw-motion mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary dw-fade-up"
                style={{ animationDelay: '0.05s' }}
              >
                Pharma warehouse clarity
              </p>
              <h1
                className="dw-motion text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.1] dw-fade-up"
                style={{ animationDelay: '0.16s' }}
              >
                Run your warehouse with confidence—not chaos.
              </h1>
              <p
                className="dw-motion mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted dw-fade-up"
                style={{ animationDelay: '0.26s' }}
              >
                DrugWare separates each company&apos;s warehouse into its own workspace: owners create an organization,
                staff join with a secure code, then everyone sees shared inventory and operations—with compliance and reports
                that pull real data—not placeholders.
              </p>
              <div
                className="dw-motion mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row dw-fade-up"
                style={{ animationDelay: '0.38s' }}
              >
                <Link
                  to="/login"
                  className="hero-cta-ring dw-motion relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-primary/25 transition-colors hover:bg-primaryDark sm:w-auto"
                >
                  Get started
                  <ArrowRight size={20} aria-hidden />
                </Link>
                <a
                  href="#features"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 shadow-card transition-colors hover:bg-slate-50 sm:w-auto"
                >
                  Explore capabilities
                </a>
              </div>
            </div>

            <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3">
              {[
                { stat: 'One workspace', detail: 'Inventory, ops, zones, reporting per company' },
                { stat: 'Role-aware', detail: 'Supervisors and warehouse staff aligned' },
                { stat: 'Multi-tenant', detail: 'Isolated organizations with shared product quality' },
              ].map(({ stat, detail }, i) => (
                <div
                  key={stat}
                  className="dw-motion rounded-2xl border border-slate-200/90 bg-white/80 p-5 text-center shadow-card backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-lg dw-fade-up"
                  style={{ animationDelay: `${0.42 + i * 0.1}s` }}
                >
                  <p className="text-lg font-semibold text-slate-900">{stat}</p>
                  <p className="mt-2 text-sm leading-snug text-muted">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Everything your operation touches</h2>
            <p className="mt-4 text-muted leading-relaxed">
              Purpose-built checkpoints reduce errors, shorten handoffs, and make audits less painful—whether you ship
              daily or manage specialised storage.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon, title, desc }) => (
              <article
                key={title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:border-primary/30 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                  {createElement(icon, { size: 22, 'aria-hidden': true })}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="who" className="border-y border-slate-200 bg-slate-50/70">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:grid-cols-2 sm:px-6 sm:items-center">
            <div>
              <div className="inline-flex rounded-xl bg-white p-3 shadow-card">
                <BarChart3 className="text-primary" size={32} aria-hidden />
              </div>
              <h2 className="mt-8 text-3xl font-bold tracking-tight text-slate-900">Right detail for each role</h2>
              <p className="mt-4 text-muted leading-relaxed">
                Warehouse staff stay focused on daily tasks—inventory movements, schedules, and floor alerts. Owners and
                supervisors get broader visibility plus tools like workforce directory and reporting slices when you
                designate an admin account during sign-up.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-slate-700">
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  Fewer interruptions: people see workflows that match how they actually work.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  Stronger oversight: supervisors track compliance and throughput without juggling five tools.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  Professional first impression for partners with a curated entry experience—not a naked login screen.
                </li>
              </ul>
              <Link
                to="/login"
                className="mt-10 inline-flex items-center gap-2 font-semibold text-primary hover:text-primaryDark"
              >
                Sign in or create an account
                <ArrowRight size={18} aria-hidden />
              </Link>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">What teams say matters</p>
              <blockquote className="mt-6 text-lg font-medium text-slate-800 leading-relaxed">
                “We replaced ad-hoc spreadsheets with one place everyone trusts. Tasks don’t disappear between shifts
                anymore.”
              </blockquote>
              <p className="mt-6 text-sm text-muted">
                Operational clarity is the baseline for regulated logistics. DrugWare is designed around that premise.
              </p>
              <div className="mt-8 flex gap-6 border-t border-slate-100 pt-8">
                <div>
                  <p className="text-2xl font-bold text-primary">24/7</p>
                  <p className="text-xs text-muted mt-1">Facility mindset</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">Traceable</p>
                  <p className="text-xs text-muted mt-1">Activities & alerts</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primaryDark px-8 py-14 text-center text-white shadow-xl shadow-primary/20 sm:px-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(255,255,255,0.25),transparent_55%)]" />
            <h2 className="relative text-2xl font-bold sm:text-3xl">Ready when your team is.</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-white/85 leading-relaxed">
              Create your account, complete quick onboarding, and start coordinating inventory and operations without
              reworking your entire stack.
            </p>
            <Link
              to="/login"
              className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-primary shadow-lg hover:bg-slate-50 transition-colors"
            >
              Get started
              <ArrowRight size={20} aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <p className="text-sm text-muted">© {new Date().getFullYear()} DrugWare · Warehouse operations</p>
          <Link to="/login" className="text-sm font-medium text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
