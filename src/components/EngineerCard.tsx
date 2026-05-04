type Props = {
  name: string
  status: string
  caseCount: number
  isSuggested?: boolean
}

export function EngineerCard({
  name,
  status,
  caseCount,
  isSuggested,
}: Props) {
  const statusColor =
    status === "available"
      ? "bg-emerald-100 text-emerald-700"
      : status === "aux"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700"

  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        isSuggested
          ? "border-blue-500 shadow-md ring-2 ring-blue-200"
          : "border-slate-200"
      }`}
    >
      <h3 className="text-lg font-semibold text-slate-900">{name}</h3>

      <div className="mt-3 flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}
        >
          {status}
        </span>

        <span className="text-sm text-slate-600">
          {caseCount} cases
        </span>
      </div>

      {isSuggested && (
        <p className="mt-3 text-xs font-medium text-blue-600">
          Next Suggested
        </p>
      )}
    </div>
  )
}