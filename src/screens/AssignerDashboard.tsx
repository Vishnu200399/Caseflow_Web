import { useEffect, useState } from "react"
import { RequestsPanel } from "../components/RequestsPanel"
import type { UserProfile } from "../lib/profile"
import { DashboardLayout } from "../components/DashboardLayout"
import {
  assignCase,
  getEngineersWithCounts,
  getSuggestedEngineer,
} from "../lib/engineers"
import { EngineerCard } from "../components/EngineerCard"
import { ExcelTable } from "../components/ExcelTable"
import { getExcelView } from "../lib/engineers"
import { supabase } from "../lib/supabase"
import { setEngineerStatus, statusOptions } from "../lib/status"

type Props = {
  profile: UserProfile
  onLogout: () => void
}

export function AssignerDashboard({ profile, onLogout }: Props) {
  const [caseNumber, setCaseNumber] = useState("")
  const [engineers, setEngineers] = useState<any[]>([])
  const [suggestedId, setSuggestedId] = useState<string | null>(null)
  const [suggestedName, setSuggestedName] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [assigning, setAssigning] = useState(false)
  const [selectedEngineer, setSelectedEngineer] = useState<any>(null)
  const [excelData, setExcelData] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [statusMessage, setStatusMessage] = useState("")
  const [statusError, setStatusError] = useState("")
  const [statusUpdating, setStatusUpdating] = useState(false)

  const showMetrics = activeTab === "dashboard"
  const showAssignment = activeTab === "dashboard" || activeTab === "assignment"
  const showEngineerOverview =
    activeTab === "dashboard" || activeTab === "assignment"
  const showExcelSection = activeTab === "dashboard" || activeTab === "excel"
  const showRequestsSection = activeTab === "dashboard" || activeTab === "requests"
  const showActivitySection = activeTab === "activity"

  useEffect(() => {
    loadData()

    const channel = supabase
      .channel("caseflow-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "case_assignments" },
        () => {
          loadData()
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "engineer_status" },
        () => {
          loadData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadData = async () => {
    setDataLoading(true)

    const region = profile.regions?.code || ""

    const { data: engineerData } = await getEngineersWithCounts(region)
    if (engineerData) setEngineers(engineerData)

    const { data: suggested } = await getSuggestedEngineer(region)
    if (suggested && suggested.length > 0) {
      setSuggestedId(suggested[0].engineer_id)
      setSuggestedName?.(suggested[0].full_name)
    } else {
      setSuggestedId(null)
      setSuggestedName?.("No available engineer")
    }

    const { data: excel } = await getExcelView?.(region)
    if (excel) setExcelData?.(excel)

    setDataLoading(false)
  }

  const handleAssign = async () => {
    setMessage("")
    setError("")

    if (!/^[0-9]{10}$/.test(caseNumber)) {
      setError("Case number must be exactly 10 digits.")
      return
    }

    setAssigning(true)

    const isOverride = !!selectedEngineer

   const { data, error } = await assignCase({
  caseNumber,
  regionCode: profile.regions?.code || "",
  assignedByEmail: profile.email,
  isOverride: !!selectedEngineer,
  overrideEngineerEmail: selectedEngineer?.email || null,
})
    setAssigning(false)

    if (error) {
      setError(error.message)
      return
    }

    const assignedName = data?.[0]?.assigned_engineer_name || "engineer"

    setMessage(`Case ${caseNumber} assigned to ${assignedName}`)
    setCaseNumber("")
    setSelectedEngineer(null)
    await loadData()
  }

  const handleSetEngineerStatus = async (status: any) => {
  if (!selectedEngineer) {
    setStatusError("Select an engineer first")
    return
  }

  const regionCode = profile.regions?.code

  if (!regionCode) {
    setStatusError("Region not found for this profile")
    return
  }

  setStatusMessage("")
  setStatusError("")
  setStatusUpdating(true)

  const { error } = await setEngineerStatus({
    actorEmail: profile.email,
    engineerEmail: selectedEngineer.email,
    regionCode,
    status,
  })

  setStatusUpdating(false)

  if (error) {
    setStatusError(error.message)
    return
  }

  setStatusMessage(`Status updated for ${selectedEngineer.full_name}`)
  await loadData()
}

  return (
    <DashboardLayout
      profile={profile}
      viewLabel="Assigner View"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={onLogout}
    >
      <div className="space-y-6">
        {showMetrics && (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total Engineers</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-900">
                {engineers.length}
              </h3>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Available</p>
              <h3 className="mt-2 text-3xl font-bold text-emerald-600">
                {engineers.filter((e) => e.status === "available").length}
              </h3>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">On AUX</p>
              <h3 className="mt-2 text-3xl font-bold text-yellow-600">
                {engineers.filter((e) => e.status === "aux").length}
              </h3>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Unavailable</p>
              <h3 className="mt-2 text-3xl font-bold text-red-500">
                {engineers.filter(
                  (e) => e.status !== "available" && e.status !== "aux"
                ).length}
              </h3>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total Cases Today</p>
              <h3 className="mt-2 text-3xl font-bold text-blue-600">
                {engineers.reduce((sum, e) => sum + Number(e.case_count || 0), 0)}
              </h3>

            </div>
          </section>
        )}


        {showAssignment && (

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Case Assignment
                </p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">
                  Assign incoming case
                </h3>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <input
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    placeholder="Enter 10-digit case number"
                    maxLength={10}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 sm:max-w-sm"
                  />

                  <button
                    onClick={handleAssign}
                    disabled={assigning}
                    className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {assigning ? "Assigning..." : "Assign Case"}
                  </button>
                </div>

                {selectedEngineer && (
                  <div className="mt-4 rounded-xl border border-purple-200 bg-purple-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                      Override Mode Active
                    </p>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium text-purple-900">
                        Selected: {selectedEngineer.full_name}
                      </p>

                      <button
                        onClick={() => setSelectedEngineer(null)}
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-purple-700 shadow-sm hover:bg-purple-100"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>
                )}

                {selectedEngineer && (
  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <div className="mb-3">
      <p className="text-sm font-semibold text-slate-900">
        Update Selected Engineer Status
      </p>

      <p className="text-xs text-slate-500">
        Change availability for {selectedEngineer.full_name}. Only Available engineers are included in round-robin.
      </p>
    </div>

    <div className="flex flex-wrap gap-2">
      {statusOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => handleSetEngineerStatus(option.value)}
          disabled={statusUpdating}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
            selectedEngineer.status === option.value
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>

    {statusMessage && (
      <p className="mt-3 text-sm font-medium text-emerald-600">
        ✅ {statusMessage}
      </p>
    )}

    {statusError && (
      <p className="mt-3 text-sm font-medium text-red-600">
        ❌ {statusError}
      </p>
    )}
  </div>
)}

                {message && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    ✅ {message}
                  </div>
                )}

                {error && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    ❌ {error}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Next Suggested Engineer
                </p>
                <h4 className="mt-3 text-xl font-bold text-slate-900">
                  {suggestedName}
                </h4>
                <p className="mt-2 text-sm text-slate-500">
                  Based on availability and fairness logic.
                </p>
              </div>
            </div>
          </section>
        )}

        {showEngineerOverview && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Engineer Overview</p>
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
                    isSelected={selectedEngineer?.engineer_id === eng.engineer_id}
                    onClick={() => setSelectedEngineer(eng)}
                  />
                ))}
              </div>
            )}
          </section>
        )}



        {showExcelSection && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Excel View
                </p>

                <h3 className="text-xl font-bold text-slate-900">
                  Case Distribution Sheet
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Read-only view of today’s case distribution by engineer.
                </p>
              </div>
            </div>

            <ExcelTable data={excelData} />
          </section>
        )}

        {showRequestsSection && (
          <RequestsPanel profile={profile} />
        )}

        {showActivitySection && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-blue-600">Activity Log</p>

            <h3 className="text-xl font-bold text-slate-900">
              Activity tracking coming soon
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Case assignments, overrides, and approvals will appear here.
            </p>
          </section>
        )}

      </div>
    </DashboardLayout>
  )
}