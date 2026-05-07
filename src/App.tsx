import { useEffect, useState } from "react"
import { signIn, signOut } from "./lib/auth"
import { getCurrentProfile, type UserProfile } from "./lib/profile"
import { EngineerDashboard } from "./screens/EngineerDashboard"
import { AssignerDashboard } from "./screens/AssignerDashboard"
import { PendingApproval } from "./screens/PendingApproval"
import { LoginScreen } from "./screens/LoginScreen"
import { SignupScreen } from "./screens/SignupScreen"

function App() {
  const [email, setEmail] = useState("ravi@caseflow.com")
  const [password, setPassword] = useState("12345678")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [authMode, setAuthMode] = useState<"login" | "signup" | "pending">("login")
  const [pendingEmail, setPendingEmail] = useState("")

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

  if (authMode === "signup") {
    return (
      <SignupScreen
        onBackToLogin={() => setAuthMode("login")}
        onSubmitted={(email) => {
          setPendingEmail(email)
          setAuthMode("pending")
        }}
      />
    )
  }

  if (authMode === "pending") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <section className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-blue-600">CASEFLOW</p>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            Request Submitted
          </h1>
          <p className="mt-3 text-slate-500">
            Your access request for <strong>{pendingEmail}</strong> is pending approval.
          </p>

          <button
            onClick={() => setAuthMode("login")}
            className="mt-6 rounded-xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800"
          >
            Back to Login
          </button>
        </section>
      </main>
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
      onSignupClick={() => setAuthMode("signup")}
    />
  )
}

export default App