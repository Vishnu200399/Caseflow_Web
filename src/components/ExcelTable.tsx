type Props = {
  data: any[]
}

export function ExcelTable({ data }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="p-3 text-left">Engineer</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Total</th>

            {[...Array(10)].map((_, i) => (
              <th key={i} className="p-3 text-center">
                {i + 1}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-3 font-medium">{row.full_name}</td>
              <td className="p-3">{row.status}</td>
              <td className="p-3">{row.total_cases}</td>

              {[...Array(10)].map((_, i) => {
                const caseNumber = row.case_numbers?.[i]

                return (
                  <td
                    key={i}
                    className="p-3 text-center text-xs text-slate-700"
                    title={
                      caseNumber
                        ? `Assigned at: ${row.assigned_times?.[i]}\nBy: ${row.assigned_by_names?.[i]}`
                        : ""
                    }
                  >
                    {caseNumber || "-"}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}