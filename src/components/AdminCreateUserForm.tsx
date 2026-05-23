import { useState } from "react"
import { adminCreateUser } from "../lib/admin"
import type { UserProfile } from "../lib/profile"

type Props = {
  profile: UserProfile
  onCreated?: () => void
}

export function AdminCreateUserForm({ profile, onCreated }: Props) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("Caseflow@123")
  const [role, setRole] = useState<"engineer" | "assigner" | "admin">("engineer")
  const [regionCode, setRegionCode] = useState<"APAC" | "EMEA" | "AMS">("APAC")
  const [displayOrder, setDisplayOrder] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleCreate = async () => {
    setMessage("")
    setError("")

    if (!fullName.trim()) {
      setError("Full name is required")
      return
    }

    if (!email.trim()) {
      setError("Email is required")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    const { data, error } = await adminCreateUser({
      adminEmail: profile.email,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      regionCode,
      displayOrder: displayOrder ? Number(displayOrder) : null,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    if (data?.error) {
      setError(data.error)
      return
    }

    setMessage("User created successfully")

    setFullName("")
    setEmail("")
    setPassword("Caseflow@123")
    setRole("engineer")
    setRegionCode("APAC")
    setDisplayOrder("")

    onCreated?.()
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-medium text-blue-600">Create User</p>
        <h2 className="text-2xl font-bold text-slate-900">
          Add a new CASEFLOW user
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Create login access, assign role, region, and display order.
        </p>
      </div>

      {message && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          ✅ {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          ❌ {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Full Name
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Example: Ramesh Kumar"
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@caseflow.com"
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Initial Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <label className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show password
          </label>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Role
          </label>
          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value as "engineer" | "assigner" | "admin")
            }
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="engineer">Engineer</option>
            <option value="assigner">Assigner</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Region
          </label>
          <select
            value={regionCode}
            onChange={(e) =>
              setRegionCode(e.target.value as "APAC" | "EMEA" | "AMS")
            }
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="APAC">APAC</option>
            <option value="EMEA">EMEA</option>
            <option value="AMS">AMS</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Display Order
          </label>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            placeholder="Example: 1"
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <button
        onClick={handleCreate}
        disabled={loading}
        className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create User"}
      </button>
    </section>
  )
}