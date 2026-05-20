import { DashboardLayout } from "../components/DashboardLayout"
import type { UserProfile } from "../lib/profile"
import { AdminUsersTable } from "../components/AdminUsersTable"

type Props = {
  profile: UserProfile
  onLogout: () => void
}

export function AdminDashboard({ profile, onLogout }: Props) {
  return (
    <DashboardLayout
      profile={profile}
      viewLabel="Admin View"
      activeTab="dashboard"
      onTabChange={() => {}}
      onLogout={onLogout}
    >
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-blue-600">Admin Dashboard</p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Welcome, {profile.full_name}
          </h1>

          <p className="mt-3 max-w-3xl text-sm text-slate-500">
            This dashboard will be used to manage CASEFLOW users, roles, regions,
            timezones, and active access across APAC, EMEA, and AMS.
          </p>
        </section>

        <AdminUsersTable profile={profile} />

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">User Management</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">
              Coming Soon
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              View users, activate/deactivate accounts, and manage access.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Role Management</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">
              Coming Soon
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Change users between Engineer, Assigner, and Admin roles.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Region Management</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">
              Coming Soon
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Move users between APAC, EMEA, and AMS dashboards.
            </p>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}