import { useEffect, useMemo, useState } from "react"
import {
  adminDeleteUser,
  adminRemoveTemporaryAssigner,
  adminUpdateUser,
  getAdminUsers,
  type AdminUser,
} from "../lib/admin"
import type { UserProfile } from "../lib/profile"

type Props = {
  profile: UserProfile
  refreshKey?: number
}

export function AdminUsersTable({ profile, refreshKey = 0 }: Props) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
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
  }, [refreshKey])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.full_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter ||
        (roleFilter === "assigner" && user.has_temp_assigner_access)

      const matchesRegion =
        regionFilter === "all" || user.region_code === regionFilter

      return matchesSearch && matchesRole && matchesRegion
    })
  }, [users, search, roleFilter, regionFilter])

  const regions = Array.from(
    new Set(users.map((user) => user.region_code).filter(Boolean))
  )

  const handleUpdateUser = async (
    user: AdminUser,
    updates: {
      role?: "engineer" | "assigner" | "admin" | null
      regionCode?: string | null
      isActive?: boolean | null
      isApproved?: boolean | null
      displayOrder?: number | null
    }
  ) => {
    setMessage("")
    setError("")
    setUpdatingId(user.profile_id)

    const { error } = await adminUpdateUser({
      adminEmail: profile.email,
      profileId: user.profile_id,
      role: updates.role ?? null,
      regionCode: updates.regionCode ?? null,
      isActive: updates.isActive ?? null,
      isApproved: updates.isApproved ?? null,
      displayOrder: updates.displayOrder ?? null,
    })

    setUpdatingId(null)

    if (error) {
      setError(error.message)
      return
    }

    setMessage(`Updated ${user.full_name}`)
    await loadUsers()
  }

  const handleRemoveTempAssigner = async (user: AdminUser) => {
    setMessage("")
    setError("")
    setUpdatingId(user.profile_id)

    const { error } = await adminRemoveTemporaryAssigner({
      adminEmail: profile.email,
      profileId: user.profile_id,
    })

    setUpdatingId(null)

    if (error) {
      setError(error.message)
      return
    }

    setMessage(`Temporary assigner access removed for ${user.full_name}`)
    await loadUsers()
  }


  const handleDeleteUser = async (user: AdminUser) => {
    const confirmed = window.confirm(
      `Permanently delete ${user.full_name}?\n\nThis cannot be undone.\n\nIf this user has case history, deletion will be blocked and you should deactivate instead.`
    )

    if (!confirmed) return

    setMessage("")
    setError("")
    setUpdatingId(user.profile_id)

    const { data, error } = await adminDeleteUser({
      adminEmail: profile.email,
      profileId: user.profile_id,
    })

    setUpdatingId(null)

    if (error) {
      setError(error.message)
      return
    }

    if (data?.error) {
      setError(data.error)
      return
    }

    setMessage(`Deleted ${user.full_name}`)
    await loadUsers()
  }

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

      {message && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          ✅ {message}
        </div>
      )}

      {loading && (
        <p className="text-sm text-slate-500">Loading users...</p>
      )}

      {!loading && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[1550px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Display Order</th>
                <th className="px-4 py-3">Approved</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Auth Linked</th>
                <th className="px-4 py-3">Temporary Access</th>
                <th className="px-4 py-3">Actions</th>
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
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${user.is_approved
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {user.is_approved ? "Approved" : "Pending"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${user.is_active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${user.auth_linked
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600"
                        }`}
                    >
                      {user.auth_linked ? "Linked" : "Not Linked"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {user.has_temp_assigner_access ? (
                      <div>
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                          Temp Assigner Active
                        </span>

                        {user.temp_assigner_expires_at && (
                          <p className="mt-2 text-xs text-slate-500">
                            Expires:{" "}
                            {new Date(user.temp_assigner_expires_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        None
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <div className="grid min-w-[380px] gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={user.role}
                          disabled={updatingId === user.profile_id}
                          onChange={(e) =>
                            handleUpdateUser(user, {
                              role: e.target.value as "engineer" | "assigner" | "admin",
                            })
                          }
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                        >
                          <option value="engineer">Engineer</option>
                          <option value="assigner">Assigner</option>
                          <option value="admin">Admin</option>
                        </select>

                        <select
                          value={user.region_code || ""}
                          disabled={updatingId === user.profile_id}
                          onChange={(e) =>
                            handleUpdateUser(user, {
                              regionCode: e.target.value,
                            })
                          }
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                        >
                          <option value="APAC">APAC</option>
                          <option value="EMEA">EMEA</option>
                          <option value="AMS">AMS</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          disabled={updatingId === user.profile_id}
                          onClick={() =>
                            handleUpdateUser(user, {
                              isActive: !user.is_active,
                            })
                          }
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                          {user.is_active ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          disabled={updatingId === user.profile_id}
                          onClick={() =>
                            handleUpdateUser(user, {
                              isApproved: !user.is_approved,
                            })
                          }
                          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          {user.is_approved ? "Set Pending" : "Approve"}
                        </button>

                        <input
                          type="number"
                          defaultValue={user.display_order ?? ""}
                          disabled={updatingId === user.profile_id}
                          onBlur={(e) =>
                            handleUpdateUser(user, {
                              displayOrder: e.target.value
                                ? Number(e.target.value)
                                : null,
                            })
                          }
                          placeholder="Order"
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                        />
                      </div>

                      {user.has_temp_assigner_access && (
                        <button
                          disabled={updatingId === user.profile_id}
                          onClick={() => handleRemoveTempAssigner(user)}
                          className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-60"
                        >
                          Remove Temp Assigner Access
                        </button>
                      )}

                      <button
                        disabled={updatingId === user.profile_id}
                        onClick={() => handleDeleteUser(user)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                      >
                        Delete User
                      </button>


                      {updatingId === user.profile_id && (
                        <p className="text-xs text-slate-500">Updating...</p>
                      )}
                    </div>
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