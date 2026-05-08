import { useEffect, useState } from "react"
import { createSignupRequest } from "../lib/auth"
import { getRegions, type Region } from "../lib/regions"

type Props = {
  onBackToLogin: () => void
  onSubmitted: (email: string) => void
}

export function SignupScreen({ onBackToLogin, onSubmitted }: Props) {
  const [regions, setRegions] = useState<Region[]>([])
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [regionId, setRegionId] = useState("")
  const [requestedRole, setRequestedRole] = useState<"engineer" | "assigner">(
    "engineer"
  )
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadRegions()
  }, [])

  const loadRegions = async () => {
    const { data } = await getRegions()

    if (data) {
      setRegions(data)
      setRegionId(data[0]?.id || "")
    }
  }

  const handleSubmit = async () => {
    const cleanEmail = email.trim().toLowerCase()
    setError("")

    if (
      !fullName.trim() ||
      !cleanEmail ||
      !username.trim() ||
      !password ||
      !confirmPassword ||
      !regionId
    ) {
      setError("Please fill all fields.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setSubmitting(true)

    const { error } = await createSignupRequest({
      fullName: fullName.trim(),
      email: cleanEmail,
      username: username.trim(),
      password,
      regionId,
      requestedRole,
    })

    setSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }

    onSubmitted(email)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-blue-600">CASEFLOW</p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Request Access
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Create your access request. An assigner will review and approve your
          account.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <input
            placeholder="Full Name"
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            placeholder="Email"
            type="email"
            name="signup-email"
            autoComplete="off"
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            placeholder="Username / Employee ID"
            name="signup-employee-id"
            autoComplete="off"
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <select
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
          >
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.code} — {region.name}
              </option>
            ))}
          </select>

          <input
            placeholder="Password"
            type="password"
            name="signup-new-password"
            autoComplete="new-password"
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            placeholder="Confirm Password"
            type="password"
            name="signup-confirm-password"
            autoComplete="new-password"
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">
            Requested Access Type
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setRequestedRole("engineer")}
              className={`rounded-xl border px-4 py-3 text-left transition ${requestedRole === "engineer"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
            >
              <p className="font-semibold">Engineer</p>
              <p className="mt-1 text-xs">
                View dashboard, manage AUX, and track cases.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setRequestedRole("assigner")}
              className={`rounded-xl border px-4 py-3 text-left transition ${requestedRole === "assigner"
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
            >
              <p className="font-semibold">Assigner</p>
              <p className="mt-1 text-xs">
                Assign cases, override, and approve requests.
              </p>
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
          AUX Rules: AUX1 = 2 times/day × 15 mins, AUX4 = 1 time/day × 60 mins.
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            ❌ {error}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>

          <button
            onClick={onBackToLogin}
            className="rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Login
          </button>
        </div>
      </section>
    </main>
  )
}