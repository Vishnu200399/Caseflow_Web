import { useState } from "react"
import {
  getRegionCaseProcessingStats,
  getRegionDailyCaseReport,
} from "../lib/cases"
import { downloadCsv } from "../lib/exportCsv"

type Props = {
  actorEmail: string
  regionCode: string
}

export function DailyReportsPanel({ actorEmail, regionCode }: Props) {
  const [loadingReport, setLoadingReport] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const today = new Date().toISOString().slice(0, 10)

  const downloadFullCaseReport = async () => {
    setError("")
    setMessage("")
    setLoadingReport("cases")

    const { data, error } = await getRegionDailyCaseReport({
      actorEmail,
      regionCode,
    })

    setLoadingReport("")

    if (error) {
      setError(error.message)
      return
    }

    const rows =
      data?.map((item) => ({
        "Case Number": item.case_number,
        "Engineer Name": item.engineer_name,
        "Engineer Email": item.engineer_email,
        "Assigned By": item.assigned_by_name || "",
        "Assigned By Email": item.assigned_by_email || "",
        "Assigned Time": item.assigned_at
          ? new Date(item.assigned_at).toLocaleString()
          : "",
        "Processing Status": item.processing_status,
        "Processing Updated At": item.processing_updated_at
          ? new Date(item.processing_updated_at).toLocaleString()
          : "",
        Region: item.region_code,
        "Work Date": item.work_date,
        "Was Override": item.was_override ? "Yes" : "No",
        "Engineer Status At Assignment":
          item.engineer_status_at_assignment || "",
      })) || []

    downloadCsv(`CASEFLOW_${regionCode}_Full_Case_Report_${today}.csv`, rows)
    setMessage("Full case report downloaded successfully.")
  }

  const downloadStatisticsReport = async () => {
    setError("")
    setMessage("")
    setLoadingReport("statistics")

    const { data, error } = await getRegionCaseProcessingStats({
      actorEmail,
      regionCode,
    })

    setLoadingReport("")

    if (error) {
      setError(error.message)
      return
    }

    const rows =
      data?.map((item) => ({
        "Engineer Name": item.engineer_name,
        "Engineer Email": item.engineer_email,
        "Total Cases": item.total_cases,
        "Processed Cases": item.processed_cases,
        "Unprocessed Cases": item.unprocessed_cases,
        "Pending Cases": item.pending_cases,
        Region: regionCode,
        "Work Date": today,
      })) || []

    downloadCsv(`CASEFLOW_${regionCode}_Statistics_Report_${today}.csv`, rows)
    setMessage("Statistics report downloaded successfully.")
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-medium text-blue-600">Daily Reports</p>
        <h3 className="text-xl font-bold text-slate-900">
          Download today&apos;s reports — {regionCode}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Export full case data and engineer-wise processing statistics as CSV.
        </p>
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

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h4 className="font-bold text-slate-900">Full Case Report</h4>
          <p className="mt-2 text-sm text-slate-500">
            Downloads all assigned cases for today, including engineer,
            assigner, case status, override, and timestamps.
          </p>

          <button
            onClick={downloadFullCaseReport}
            disabled={loadingReport === "cases"}
            className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingReport === "cases"
              ? "Preparing..."
              : "Download Full Case CSV"}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h4 className="font-bold text-slate-900">Statistics Report</h4>
          <p className="mt-2 text-sm text-slate-500">
            Downloads engineer-wise totals for processed, unprocessed, pending,
            and total assigned cases for today.
          </p>

          <button
            onClick={downloadStatisticsReport}
            disabled={loadingReport === "statistics"}
            className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingReport === "statistics"
              ? "Preparing..."
              : "Download Statistics CSV"}
          </button>
        </div>
      </div>
    </section>
  )
}