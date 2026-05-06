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

  const statusColor =
    status === "available"
      ? "bg-emerald-100 text-emerald-700"
      : status === "aux"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700"

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
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusColor}`}>
          {status === "available"
            ? "Available"
            : status === "aux"
              ? "On AUX"
              : status === "offline"
                ? "Offline"
                : status}
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

      {isSelected && <p className="mt-3 text-xs font-medium text-purple-600">Selected</p>}

      {!isSelected && isSuggested && (
        <p className="mt-3 text-xs font-medium text-blue-600">Suggested</p>
      )}
    </div>
  )
}