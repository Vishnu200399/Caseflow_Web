import { useEffect, useState } from "react"
import type { UserProfile } from "../lib/profile"
import {
  approveSignupRequest,
  getSignupRequests,
  rejectSignupRequest,
  type SignupRequest,
} from "../lib/requests"

type Props = {
  profile: UserProfile
}

export function RequestsPanel({ profile }: Props) {
  const [requests, setRequests] = useState<SignupRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setLoading(true)
    const { data } = await getSignupRequests(profile.region_id)
    if (data) setRequests(data)
    setLoading(false)
  }

  const handleApprove = async (requestId: string) => {
    setMessage("")
    const { error } = await approveSignupRequest(requestId, profile.id)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage("Request approved")
    await loadRequests()
  }

  const handleReject = async (requestId: string) => {
    setMessage("")
    const { error } = await rejectSignupRequest(requestId, profile.id)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage("Request rejected")
    await loadRequests()
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Requests</p>
          <h3 className="text-xl font-bold text-slate-900">
            Pending access approvals
          </h3>
        </div>

        <button
          onClick={loadRequests}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {message && (
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading requests...</p>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <h4 className="font-semibold text-slate-900">No pending requests</h4>
          <p className="mt-2 text-sm text-slate-500">
            New signup requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-slate-900">
                    {request.full_name}
                  </h4>
                  <p className="text-sm text-slate-500">{request.email}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Shift: {request.requested_shift || "-"} · Project:{" "}
                    {request.requested_project || "-"}
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
      )}
    </section>
  )
}