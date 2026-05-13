import { useEffect, useState } from "react"
import type { UserProfile } from "../lib/profile"
import { DashboardLayout } from "../components/DashboardLayout"
import {
  getEngineersWithCounts,
  getSuggestedEngineer,
  startAux,
  endAux,
} from "../lib/engineers"
import { EngineerCard } from "../components/EngineerCard"
import { ExcelTable } from "../components/ExcelTable"
import { getExcelView } from "../lib/engineers"

export function EngineerDashboard({ profile, onLogout }: any) {
  const [engineers, setEngineers] = useState<any[]>([])
  const [suggestedId, setSuggestedId] = useState<string | null>(null)
  const [myStatus, setMyStatus] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [dataLoading, setDataLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [excelData, setExcelData] = useState<any[]>([])

  const showMetrics = activeTab === "dashboard"
  const showAuxPanel = activeTab === "dashboard" || activeTab === "aux"
  const showTeamOverview = activeTab === "dashboard"
  const showMyCases = activeTab === "dashboard" || activeTab === "cases"
  const showExcelSection = activeTab === "dashboard" || activeTab === "excel"
  const showActivitySection = activeTab === "activity"

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const region = profile.regions?.code || ""

    const { data } = await getEngineersWithCounts(region)
    if (data) setEngineers(data)

    const { data: suggested } = await getSuggestedEngineer(region)
    if (suggested && suggested.length > 0) {
      setSuggestedId(suggested[0].engineer_id)
    } else {
      setSuggestedId(null)
    }

    const me = data?.find((e: any) => e.full_name === profile.full_name)
    setMyStatus(me)

    const { data: excel } = await getExcelView(region)
    if (excel) setExcelData(excel)
  }



  const handleStartAux = async (type: "AUX1" | "AUX4") => {
    setMessage("")

    const { error } = await startAux(
      profile.email,
      profile.regions?.code || "",
      type
    )

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage(`${type} started`)
    await loadData()
  }

  const handleEndAux = async () => {
    const { error } = await endAux(
      profile.email,
      profile.regions?.code || ""
    )

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage("AUX ended")
    await loadData()
  }

  return (
    <DashboardLayout
      profile={profile}
      viewLabel="Engineer View"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={onLogout}
    >
      <div className="space-y-6">
        {showMetrics && (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">My Status</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {myStatus?.status === "available"
                  ? "Available"
                  : myStatus?.status === "aux"
                    ? "On AUX"
                    : myStatus?.status || "Unknown"}
              </h3>
            </div>


            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">My Cases Today</p>
              <h3 className="mt-2 text-3xl font-bold text-blue-600">
                {myStatus?.case_count || 0}
              </h3>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Available Engineers</p>
              <h3 className="mt-2 text-3xl font-bold text-emerald-600">
                {engineers.filter((e) => e.status === "available").length}
              </h3>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Team Cases Today</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-900">
                {engineers.reduce((sum, e) => sum + Number(e.case_count || 0), 0)}
              </h3>
            </div>
          </section>
        )}

        {/* AUX PANEL */}
        {showAuxPanel && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-blue-600">AUX Control</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => handleStartAux("AUX1")}
                className="rounded-xl bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
              >
                Start AUX1 (15 min)
              </button>

              <button
                onClick={() => handleStartAux("AUX4")}
                className="rounded-xl bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
              >
                Start AUX4 (60 min)
              </button>

              <button
                onClick={handleEndAux}
                className="rounded-xl bg-slate-800 px-4 py-2 text-white hover:bg-slate-900"
              >
                End AUX
              </button>
            </div>

            {message && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                {message}
              </div>
            )}
          </section>
        )}

        {/* ENGINEER CARDS */}
        {showTeamOverview && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Team Overview
                </p>

                <h3 className="text-xl font-bold text-slate-900">
                  Live engineer availability
                </h3>
              </div>

              <p className="text-sm text-slate-500">
                {engineers.length} engineers
              </p>
            </div>

            {engineers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <h3 className="text-lg font-semibold text-slate-900">
                  No engineers found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Engineers assigned to this region will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {engineers.map((eng) => (
                  <EngineerCard
                    key={eng.engineer_id}
                    name={eng.full_name}
                    status={eng.status}
                    caseCount={eng.case_count}
                    auxType={eng.aux_type}
                    auxEndsAt={eng.aux_ends_at}
                    auxExceeded={eng.aux_exceeded}
                    isSuggested={eng.engineer_id === suggestedId}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {showMyCases && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5">
              <p className="text-sm font-medium text-blue-600">My Cases</p>
              <h3 className="text-xl font-bold text-slate-900">
                Cases assigned to me today
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left text-slate-600">
                    <th className="px-4 py-3">Case #</th>
                    <th className="px-4 py-3">Assigned By</th>
                    <th className="px-4 py-3">Assigned Time</th>
                  </tr>
                </thead>

                <tbody>
                  {excelData
                    .find((row) => row.email === profile.email)
                    ?.case_numbers?.map((caseNumber: string, index: number) => (
                      <tr key={caseNumber} className="border-b">
                        <td className="px-4 py-3 font-mono font-semibold text-blue-700">
                          {caseNumber}
                        </td>
                        <td className="px-4 py-3">
                          {excelData.find((row) => row.email === profile.email)
                            ?.assigned_by_names?.[index] || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {excelData.find((row) => row.email === profile.email)
                            ?.assigned_times?.[index] || "-"}
                        </td>
                      </tr>
                    ))}

                  {!excelData.find((row) => row.email === profile.email)?.case_numbers
                    ?.length && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-8 text-center text-slate-500"
                        >
                          No cases assigned to you today.
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {showExcelSection && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5">
              <p className="text-sm font-medium text-blue-600">Excel View</p>
              <h3 className="text-xl font-bold text-slate-900">
                Team Case Distribution Sheet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Read-only view of today’s case distribution.
              </p>
            </div>

            <ExcelTable data={excelData} />
          </section>
        )}

        {showActivitySection && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-blue-600">Activity Log</p>
            <h3 className="text-xl font-bold text-slate-900">
              Activity tracking coming soon
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Your AUX usage and assigned case events will appear here.
            </p>
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}