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
  const [regionId, setRegionId] = useState("")
  const [shift, setShift] = useState("")
  const [project, setProject] = useState("")
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
    setError("")

    if (!fullName || !email || !username || !regionId || !shift || !project) {
      setError("Please fill all fields.")
      return
    }

    setSubmitting(true)

    const { error } = await createSignupRequest({
      fullName,
      email,
      username,
      regionId,
      shift,
      project,
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
          Submit your details. An assigner will review and approve your access.
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
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            placeholder="Username / Employee ID"
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
            placeholder="Shift Name / Timing"
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            value={shift}
            onChange={(e) => setShift(e.target.value)}
          />

          <input
            placeholder="Project / Team"
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            value={project}
            onChange={(e) => setProject(e.target.value)}
          />
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