type Props = {
  name: string
  status: string
  caseCount: number
  isSuggested?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export function EngineerCard({
  name,
  status,
  caseCount,
  isSuggested,
  isSelected,
  onClick,
}: Props) {
  const statusColor =
    status === "available"
      ? "bg-emerald-100 text-emerald-700"
      : status === "aux"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700"

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border bg-white p-5 transition ${
        onClick ? "cursor-pointer" : ""
      } ${
        isSelected
          ? "border-purple-500 ring-2 ring-purple-200"
          : isSuggested
          ? "border-blue-500 ring-2 ring-blue-200"
          : "border-slate-200"
      }`}
    >
      <h3 className="text-lg font-semibold text-slate-900">{name}</h3>

      <div className="mt-3 flex items-center justify-between">
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>
          {status}
        </span>

        <span className="text-sm text-slate-600">{caseCount} cases</span>
      </div>

      {isSelected && <p className="mt-2 text-xs text-purple-600">Selected</p>}

      {!isSelected && isSuggested && (
        <p className="mt-2 text-xs text-blue-600">Suggested</p>
      )}
    </div>
  )
}