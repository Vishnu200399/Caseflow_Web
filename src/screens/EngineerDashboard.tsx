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

export function EngineerDashboard({ profile, onLogout }: any) {
  const [engineers, setEngineers] = useState<any[]>([])
  const [suggestedId, setSuggestedId] = useState<string | null>(null)
  const [myStatus, setMyStatus] = useState<any>(null)
  const [message, setMessage] = useState("")

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
    }

    const me = data?.find((e: any) => e.full_name === profile.full_name)
    setMyStatus(me)
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
      onLogout={onLogout}
    >
      <div className="space-y-6">

        {/* AUX PANEL */}
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
            <p className="mt-3 text-sm font-medium text-blue-600">
              {message}
            </p>
          )}
        </section>

        {/* ENGINEER CARDS */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {engineers.map((eng: any) => (
            <EngineerCard
              key={eng.engineer_id}
              name={eng.full_name}
              status={eng.status}
              caseCount={eng.case_count}
              isSuggested={eng.engineer_id === suggestedId}
            />
          ))}
        </section>
      </div>
    </DashboardLayout>
  )
}