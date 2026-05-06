import {
  Activity,
  ClipboardList,
  Clock,
  LayoutDashboard,
  LogOut,
  Table2,
  Timer,
  UserCheck,
} from "lucide-react"
import type { UserProfile } from "../lib/profile"

type DashboardLayoutProps = {
  profile: UserProfile
  viewLabel: "Engineer View" | "Assigner View"
  onLogout: () => void
  children: React.ReactNode
}

export function DashboardLayout({
  profile,
  viewLabel,
  onLogout,
  children,
}: DashboardLayoutProps) {
  const isAssigner = profile.role === "assigner"

  const navItems = isAssigner
    ? [
        { label: "Dashboard", icon: LayoutDashboard, active: true },
        { label: "Case Assignment", icon: ClipboardList },
        { label: "Excel View", icon: Table2 },
        { label: "Requests", icon: UserCheck },
        { label: "Activity Log", icon: Activity },
      ]
    : [
        { label: "Dashboard", icon: LayoutDashboard, active: true },
        { label: "My AUX", icon: Timer },
        { label: "My Cases", icon: ClipboardList },
        { label: "Excel View", icon: Table2 },
        { label: "Activity Log", icon: Clock },
      ]

  return (
    <main className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-72 flex-col bg-slate-950 px-5 py-6 text-white lg:flex">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">
            CASEFLOW
          </p>
          <h1 className="mt-3 text-2xl font-bold">Control Center</h1>
          <p className="mt-2 text-sm text-slate-400">
            {profile.regions?.code} Region
          </p>
        </div>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.label}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  item.active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto rounded-2xl bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">
              {profile.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {profile.full_name}
              </p>
              <p className="truncate text-xs text-slate-400">
                {profile.role}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-slate-950 px-4 py-4 text-white lg:hidden">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
              CASEFLOW
            </p>
            <p className="text-sm font-semibold">
              {profile.regions?.code} Dashboard
            </p>
          </div>

          <button
            onClick={onLogout}
            className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-900"
          >
            Logout
          </button>
        </header>

        <header className="border-b bg-white px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-600">{viewLabel}</p>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                {profile.regions?.code} CaseFlow Dashboard
              </h2>
            </div>

            <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              ● Live Updates
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6">{children}</div>
      </section>
    </main>
  )
}