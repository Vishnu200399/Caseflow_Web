import { useEffect, useMemo, useState } from "react"
import {
  getRegionCaseProcessingStats,
  type RegionCaseProcessingStat,
} from "../lib/cases"

type Props = {
  actorEmail: string
  regionCode: string
}

export function CaseProcessingStatsPanel({ actorEmail, regionCode }: Props) {
  const [stats, setStats] = useState<RegionCaseProcessingStat[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const loadStats = async () => {
    setLoading(true)
    setError("")

    const { data, error } = await getRegionCaseProcessingStats({
      actorEmail,
      regionCode,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setStats(data || [])
  }

  useEffect(() => {
    loadStats()
  }, [actorEmail, regionCode])

  const totals = useMemo(() => {
    return stats.reduce(
      (acc, item) => {
        acc.total += Number(item.total_cases || 0)
        acc.processed += Number(item.processed_cases || 0)
        acc.unprocessed += Number(item.unprocessed_cases || 0)
        acc.pending += Number(item.pending_cases || 0)
        return acc
      },
      {
        total: 0,
        processed: 0,
        unprocessed: 0,
        pending: 0,
      }
    )
  }, [stats])

  const maxValue = Math.max(
    1,
    ...stats.flatMap((item) => [
      Number(item.total_cases || 0),
      Number(item.processed_cases || 0),
      Number(item.unprocessed_cases || 0),
    ])
  )

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Case Processing Statistics
          </p>
          <h3 className="text-xl font-bold text-slate-900">
            Region Productivity Overview — {regionCode}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Real-time processed and unprocessed case summary for today.
          </p>
        </div>

        <button
          onClick={loadStats}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          ❌ {error}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Total Assigned</p>
          <h4 className="mt-1 text-3xl font-bold text-slate-900">
            {totals.total}
          </h4>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-700">Processed</p>
          <h4 className="mt-1 text-3xl font-bold text-emerald-700">
            {totals.processed}
          </h4>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">Unprocessed</p>
          <h4 className="mt-1 text-3xl font-bold text-red-700">
            {totals.unprocessed}
          </h4>
        </div>

        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-700">Pending</p>
          <h4 className="mt-1 text-3xl font-bold text-yellow-700">
            {totals.pending}
          </h4>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          Loading statistics...
        </div>
      ) : (
        <>
          <div className="mb-8 rounded-2xl border border-slate-200 p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">
                  Engineer-wise Bar Graph
                </h4>
                <p className="text-sm text-slate-500">
                  Total vs Processed vs Unprocessed cases
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-xs font-medium">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-slate-800" />
                  Total
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-emerald-500" />
                  Processed
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-red-500" />
                  Unprocessed
                </span>
              </div>
            </div>

            <div className="space-y-5">
              {stats.map((item) => {
                const totalPercent =
                  (Number(item.total_cases || 0) / maxValue) * 100
                const processedPercent =
                  (Number(item.processed_cases || 0) / maxValue) * 100
                const unprocessedPercent =
                  (Number(item.unprocessed_cases || 0) / maxValue) * 100

                return (
                  <div key={item.engineer_id}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">
                        {item.engineer_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Total: {item.total_cases} | Processed:{" "}
                        {item.processed_cases} | Unprocessed:{" "}
                        {item.unprocessed_cases}
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <div className="h-3 rounded-full bg-slate-100">
                        <div
                          className="h-3 rounded-full bg-slate-800"
                          style={{ width: `${totalPercent}%` }}
                        />
                      </div>

                      <div className="h-3 rounded-full bg-slate-100">
                        <div
                          className="h-3 rounded-full bg-emerald-500"
                          style={{ width: `${processedPercent}%` }}
                        />
                      </div>

                      <div className="h-3 rounded-full bg-slate-100">
                        <div
                          className="h-3 rounded-full bg-red-500"
                          style={{ width: `${unprocessedPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Engineer
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Total Cases
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Processed
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Unprocessed
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Pending
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {stats.map((item) => (
                  <tr key={item.engineer_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">
                        {item.engineer_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.engineer_email}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {item.total_cases}
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">
                      {item.processed_cases}
                    </td>
                    <td className="px-4 py-3 font-semibold text-red-700">
                      {item.unprocessed_cases}
                    </td>
                    <td className="px-4 py-3 font-semibold text-yellow-700">
                      {item.pending_cases}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}