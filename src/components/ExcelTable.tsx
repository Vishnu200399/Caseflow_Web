type Props = {
  data: any[]
}

function formatStatus(status: string) {
  if (status === "available") return "Available"
  if (status === "aux") return "On AUX"
  return status
}

export function ExcelTable({ data }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
              <th className="sticky left-0 z-10 bg-slate-100 px-4 py-3">
                Engineer
              </th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>

              {[...Array(10)].map((_, i) => (
                <th key={i} className="px-4 py-3 text-center">
                  Case {i + 1}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data.map((row, idx) => (
              <tr key={row.engineer_id || idx} className="hover:bg-slate-50">
                <td className="sticky left-0 z-10 bg-white px-4 py-3 font-semibold text-slate-900">
                  {row.full_name}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      row.status === "available"
                        ? "bg-emerald-100 text-emerald-700"
                        : row.status === "aux"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {formatStatus(row.status)}
                  </span>
                </td>

                <td className="px-4 py-3 font-semibold text-slate-700">
                  {row.total_cases}
                </td>

                {[...Array(10)].map((_, i) => {
                  const caseNumber = row.case_numbers?.[i]

                  return (
                    <td key={i} className="px-4 py-3 text-center">
                      {caseNumber ? (
                        <span
                          title={`Assigned at: ${
                            row.assigned_times?.[i] || "-"
                          }\nBy: ${row.assigned_by_names?.[i] || "-"}`}
                          className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 font-mono text-xs font-semibold text-blue-700 ring-1 ring-blue-100"
                        >
                          {caseNumber}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}