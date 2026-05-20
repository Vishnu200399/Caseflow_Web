import { useEffect, useMemo, useState } from "react"
import { getAdminUsers, type AdminUser } from "../lib/admin"
import type { UserProfile } from "../lib/profile"

type Props = {
  profile: UserProfile
}

export function AdminUsersTable({ profile }: Props) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")

  const loadUsers = async () => {
    setLoading(true)
    setError("")

    const { data, error } = await getAdminUsers(profile.email)

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setUsers(data)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.full_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter

      const matchesRegion =
        regionFilter === "all" || user.region_code === regionFilter

      return matchesSearch && matchesRole && matchesRegion
    })
  }, [users, search, roleFilter, regionFilter])

  const regions = Array.from(
    new Set(users.map((user) => user.region_code).filter(Boolean))
  )

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-600">User Management</p>
          <h2 className="text-2xl font-bold text-slate-900">
            CASEFLOW Users
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            View all engineers, assigners, and admins across regions.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="engineer">Engineer</option>
          <option value="assigner">Assigner</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        >
          <option value="all">All Regions</option>
          {regions.map((region) => (
            <option key={region} value={region || ""}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          ❌ {error}
        </div>
      )}

      {loading && (
        <p className="text-sm text-slate-500">Loading users...</p>
      )}

      {!loading && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Display Order</th>
                <th className="px-4 py-3">Approved</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Auth Linked</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.profile_id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">
                      {user.full_name}
                    </p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>

                  <td className="px-4 py-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                      {user.role}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-700">
                      {user.region_code || "-"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user.region_name || ""}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-slate-700">
                    {user.display_order ?? "-"}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.is_approved
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {user.is_approved ? "Approved" : "Pending"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.auth_linked
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {user.auth_linked ? "Linked" : "Not Linked"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500">
              No users found.
            </div>
          )}
        </div>
      )}
    </section>
  )
}