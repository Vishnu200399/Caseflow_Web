import type { UserProfile } from "../lib/profile"

type Props = {
  profile: UserProfile
  onLogout: () => void
}

export function EngineerDashboard({ profile, onLogout }: Props) {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <section className="mx-auto max-w-6xl rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-600">ENGINEER VIEW</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Welcome, {profile.full_name}
            </h1>
            <p className="mt-2 text-slate-500">
              Region: {profile.regions?.code} — {profile.regions?.name}
            </p>
          </div>

          <button
            onClick={onLogout}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Logout
          </button>
        </div>

        <div className="mt-8 rounded-xl border bg-slate-50 p-6">
          Engineer dashboard will show Card View, Excel View, and AUX controls.
        </div>
      </section>
    </main>
  )
}