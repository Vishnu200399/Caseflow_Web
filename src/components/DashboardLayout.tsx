import { LayoutDashboard, LogOut, Users, Table2, Clock } from "lucide-react"
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
  return (
    <main className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-72 flex-col bg-slate-950 px-5 py-6 text-white lg:flex">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">
            CASEFLOW
          </p>
          <h1 className="mt-3 text-2xl font-bold">Control Center</h1>
        </div>

        <nav className="mt-10 space-y-2">
          <div className="flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium">
            <LayoutDashboard size={18} />
            Dashboard
          </div>

          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300">
            <Users size={18} />
            Engineers
          </div>

          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300">
            <Table2 size={18} />
            Excel View
          </div>

          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300">
            <Clock size={18} />
            Activity
          </div>
        </nav>

        <div className="mt-auto rounded-2xl bg-slate-900 p-4">
          <p className="text-sm font-semibold">{profile.full_name}</p>
          <p className="mt-1 text-xs text-slate-400">{profile.email}</p>
          <p className="mt-3 rounded-full bg-slate-800 px-3 py-1 text-xs text-blue-300">
            {viewLabel}
          </p>

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
        <header className="border-b bg-white px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-600">{viewLabel}</p>
              <h2 className="text-2xl font-bold text-slate-900">
                {profile.regions?.code} CaseFlow Dashboard
              </h2>
            </div>

            <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              ● Live
            </div>
          </div>
        </header>

        <div className="p-6">{children}</div>
      </section>
    </main>
  )
}