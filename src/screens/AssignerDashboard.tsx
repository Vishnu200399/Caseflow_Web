import { useEffect, useState } from "react"
import type { UserProfile } from "../lib/profile"
import { DashboardLayout } from "../components/DashboardLayout"
import {
  assignCase,
  getEngineersWithCounts,
  getSuggestedEngineer,
} from "../lib/engineers"
import { EngineerCard } from "../components/EngineerCard"

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

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const region = profile.regions?.code || ""

    const { data: engineerData } = await getEngineersWithCounts(region)
    if (engineerData) setEngineers(engineerData)

    const { data: suggested } = await getSuggestedEngineer(region)
    if (suggested && suggested.length > 0) {
      setSuggestedId(suggested[0].engineer_id)
      setSuggestedName(suggested[0].full_name)
    } else {
      setSuggestedId(null)
      setSuggestedName("No available engineer")
    }
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

    const { data, error } = await assignCase(
      caseNumber,
      profile.regions?.code || "",
      profile.email,
      isOverride,
      selectedEngineer?.email
    )
    setAssigning(false)

    if (error) {
      setError(error.message)
      return
    }

    const assignedName = data?.[0]?.assigned_engineer_name || "engineer"

    setMessage(`Case ${caseNumber} assigned to ${assignedName}`)
    setCaseNumber("")
    await loadData()
  }

  return (
    <DashboardLayout
      profile={profile}
      viewLabel="Assigner View"
      onLogout={onLogout}
    >
      <div className="space-y-6">
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
  <p className="mt-2 text-sm text-purple-600">
    Selected: {selectedEngineer.full_name}
  </p>
)}

              {message && (
                <p className="mt-3 text-sm font-medium text-emerald-600">
                  ✅ {message}
                </p>
              )}

              {error && (
                <p className="mt-3 text-sm font-medium text-red-500">
                  ❌ {error}
                </p>
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

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {engineers.map((eng) => (
            <EngineerCard
              key={eng.engineer_id}
              name={eng.full_name}
              status={eng.status}
              caseCount={eng.case_count}
              isSuggested={eng.engineer_id === suggestedId}
              isSelected={selectedEngineer?.engineer_id === eng.engineer_id}
              onClick={() => setSelectedEngineer(eng)}
            />
          ))}
        </section>
      </div>
    </DashboardLayout>
  )
}