import { signOut } from "../lib/auth"
import type { UserProfile } from "../lib/profile"

export function PendingApproval({ profile }: { profile: UserProfile }) {
  const handleLogout = async () => {
    await signOut()
    window.location.reload()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-blue-600">CASEFLOW</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Access Pending Approval
        </h1>
        <p className="mt-3 text-slate-500">
          Your account is created, but an assigner must approve your access before
          you can enter the dashboard.
        </p>

        <div className="mt-6 rounded-xl border bg-slate-50 p-4 text-left text-sm text-slate-700">
          <p>
            <strong>Name:</strong> {profile.full_name}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Region:</strong> {profile.regions?.code}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
        >
          Back to Login
        </button>
      </section>
    </main>
  )
}