import { useEffect, useState } from "react"

type Props = {
  name: string
  status: string
  caseCount: number
  auxType?: string | null
  auxEndsAt?: string | null
  auxExceeded?: boolean
  isSuggested?: boolean
  isSelected?: boolean
  onClick?: () => void
}

function formatRemaining(ms: number) {
  if (ms <= 0) return "00:00"

  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

const statusLabels: Record<string, string> = {
  available: "Available",
  aux: "On AUX",
  leave: "Leave",
  training: "Training",
  out_of_shift: "Out of Shift",
  it_issue: "IT Issue",
  week_off: "Week Off",
  sick_leave: "Sick Leave",
}

const statusClasses: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700",
  aux: "bg-yellow-100 text-yellow-700",
  leave: "bg-red-100 text-red-700",
  training: "bg-purple-100 text-purple-700",
  out_of_shift: "bg-slate-200 text-slate-700",
  it_issue: "bg-orange-100 text-orange-700",
  week_off: "bg-slate-100 text-slate-600",
  sick_leave: "bg-rose-100 text-rose-700",
}

export function EngineerCard({
  name,
  status,
  caseCount,
  auxType,
  auxEndsAt,
  auxExceeded,
  isSuggested,
  isSelected,
  onClick,
}: Props) {
  const [remaining, setRemaining] = useState("")

  useEffect(() => {
    if (!auxEndsAt || status !== "aux") {
      setRemaining("")
      return
    }

    const updateTimer = () => {
      const endTime = new Date(auxEndsAt).getTime()
      const now = Date.now()
      setRemaining(formatRemaining(endTime - now))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [auxEndsAt, status])

  

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border bg-white p-5 transition-all duration-200 ${onClick ? "cursor-pointer hover:-translate-y-1 hover:shadow-xl" : ""
        } ${isSelected
          ? "border-purple-500 ring-2 ring-purple-200"
          : isSuggested
            ? "border-blue-500 ring-2 ring-blue-200"
            : "border-slate-200"
        }`}
    >
      <h3 className="text-lg font-semibold text-slate-900">{name}</h3>

      <div className="mt-3 flex items-center justify-between">
        <span
  className={`rounded-full px-3 py-1 text-xs font-semibold ${
    statusClasses[status] || "bg-slate-100 text-slate-600"
  }`}
>
  {statusLabels[status] || status}
</span>
        <span className="text-sm text-slate-600">{caseCount} cases</span>
      </div>

      {status === "aux" && (
        <div className="mt-4 rounded-xl bg-yellow-50 p-3">
          <p className="text-xs font-semibold text-yellow-700">
            {auxType} Break
          </p>
          <p className="mt-1 text-lg font-bold text-yellow-800">
            {remaining} remaining
          </p>
          {auxExceeded && (
            <p className="mt-1 text-xs font-medium text-red-600">
              AUX exceeded
            </p>
          )}
        </div>
      )}

      {status !== "available" && status !== "aux" && (
  <p className="mt-3 text-xs text-slate-500">
    Excluded from round-robin while {statusLabels[status] || status}.
  </p>
)}

      {isSelected && <p className="mt-3 text-xs font-medium text-purple-600">Selected</p>}

      {!isSelected && isSuggested && (
        <p className="mt-3 text-xs font-medium text-blue-600">Suggested</p>
      )}
    </div>
  )
}