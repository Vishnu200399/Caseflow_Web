import { useEffect, useState } from "react"
import {
  approveTemporaryAssigner,
  getTemporaryAssignerRequests,
  rejectTemporaryAssigner,
} from "../lib/tempAssigner"
import type { UserProfile } from "../lib/profile"

type Props = {
  profile: UserProfile
}

type TempRequest = {
  id: string
  status: string
  reason: string | null
  requested_at: string
  expires_at: string | null
  engineer: {
    full_name: string
    email: string
  } | null
}

export function TemporaryAssignerRequestsPanel({ profile }: Props) {
  const [requests, setRequests] = useState<TempRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const regionCode = profile.regions?.code || ""

  const loadRequests = async () => {
    setLoading(true)
    setError("")

    const { data, error } = await getTemporaryAssignerRequests(regionCode)

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setRequests((data || []) as TempRequest[])
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const handleApprove = async (requestId: string) => {
    setMessage("")
    setError("")

    const { error } = await approveTemporaryAssigner({
      requestId,
      approverEmail: profile.email,
    })

    if (error) {
      setError(error.message)
      return
    }

    setMessage("Temporary assigner access approved")
    await loadRequests()
  }

  const handleReject = async (requestId: string) => {
    setMessage("")
    setError("")

    const { error } = await rejectTemporaryAssigner({
      requestId,
      rejectorEmail: profile.email,
      reason: "Rejected by assigner",
    })

    if (error) {
      setError(error.message)
      return
    }

    setMessage("Temporary assigner request rejected")
    await loadRequests()
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-purple-600">
            Temporary Assigner Requests
          </p>
          <h3 className="text-xl font-bold text-slate-900">
            Pending temporary access
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Approve engineers to act as assigners for the day.
          </p>
        </div>

        <button
          onClick={loadRequests}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
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

      {loading && (
        <p className="text-sm text-slate-500">Loading temporary requests...</p>
      )}

      {!loading && requests.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="font-medium text-slate-700">
            No temporary assigner requests.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            New engineer requests will appear here.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">
                  {request.engineer?.full_name || "Unknown Engineer"}
                </p>
                <p className="text-sm text-slate-500">
                  {request.engineer?.email}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Reason: {request.reason || "No reason provided"}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(request.id)}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Approve
                </button>

                <button
                  onClick={() => handleReject(request.id)}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}