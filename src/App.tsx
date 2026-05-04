import { useEffect, useState } from "react"
import { signIn, signOut } from "./lib/auth"
import { getCurrentProfile, type UserProfile } from "./lib/profile"
import { EngineerDashboard } from "./screens/EngineerDashboard"
import { AssignerDashboard } from "./screens/AssignerDashboard"
import { PendingApproval } from "./screens/PendingApproval"
import { LoginScreen } from "./screens/LoginScreen"

function App() {
  const [email, setEmail] = useState("ravi@caseflow.com")
  const [password, setPassword] = useState("12345678")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    const { profile } = await getCurrentProfile()
    setProfile(profile)
    setLoading(false)
  }

  const handleLogin = async () => {
    setError("")
    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      return
    }

    await loadProfile()
  }

  const handleLogout = async () => {
    await signOut()
    setProfile(null)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Loading CASEFLOW...</p>
      </main>
    )
  }

  if (profile) {
    if (!profile.is_approved || !profile.is_active) {
      return <PendingApproval profile={profile} />
    }

    if (profile.role === "assigner") {
      return (
        <AssignerDashboard
          profile={profile}
          onLogout={handleLogout}
        />
      )
    }

    return (
      <EngineerDashboard
        profile={profile}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <LoginScreen
      email={email}
      password={password}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onLogin={handleLogin}
    />
  )
}

export default App