import { useEffect, useState } from "react"
import { signIn, signOut } from "./lib/auth"
import { getCurrentProfile, type UserProfile } from "./lib/profile"
import { EngineerDashboard } from "./screens/EngineerDashboard"
import { AssignerDashboard } from "./screens/AssignerDashboard"
import { PendingApproval } from "./screens/PendingApproval"
import { LoginScreen } from "./screens/LoginScreen"
import { SignupScreen } from "./screens/SignupScreen"
import { ForgotPasswordScreen } from "./screens/ForgotPasswordScreen"
import { ResetPasswordScreen } from "./screens/ResetPasswordScreen"
import { supabase } from "./lib/supabase"
import { hasActiveAssignerAccess } from "./lib/tempAssigner"
import { AdminDashboard } from "./screens/AdminDashboard"

function App() {
  const [email, setEmail] = useState("ravi@caseflow.com")
  const [password, setPassword] = useState("12345678")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
 const [authMode, setAuthMode] = useState<
  "login" | "signup" | "pending" | "forgot" | "reset"
>("login")
  const [pendingEmail, setPendingEmail] = useState("")
  const [hasTempAssignerAccess, setHasTempAssignerAccess] = useState(false)

useEffect(() => {
  const isRecoveryUrl = () => {
    const hashParams = new URLSearchParams(
      window.location.hash.replace("#", "")
    )

    const queryParams = new URLSearchParams(window.location.search)

    return (
      hashParams.get("type") === "recovery" ||
      queryParams.get("type") === "recovery" ||
      queryParams.has("code")
    )
  }

  const initializeApp = async () => {
    if (isRecoveryUrl()) {
      setAuthMode("reset")
      setProfile(null)
      setLoading(false)
      return
    }

    await loadProfile()
  }

  initializeApp()

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
      setAuthMode("reset")
      setProfile(null)
      setLoading(false)
    }
  })

  return () => {
    subscription.unsubscribe()
  }
}, [])

 const loadProfile = async () => {
  setLoading(true)

  const { profile } = await getCurrentProfile()
  setProfile(profile)

  if (profile?.email && profile.regions?.code) {
    const { data } = await hasActiveAssignerAccess({
      email: profile.email,
      regionCode: profile.regions.code,
    })

    setHasTempAssignerAccess(Boolean(data))
  } else {
    setHasTempAssignerAccess(false)
  }

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
  setHasTempAssignerAccess(false)
}

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Loading CASEFLOW...</p>
      </main>
    )
  }

    if (authMode === "reset") {
  return (
    <ResetPasswordScreen
      onPasswordUpdated={() => {
        setProfile(null)
        setAuthMode("login")
      }}
    />
  )
}

 if (profile) {
  if (!profile.is_approved || !profile.is_active) {
    return <PendingApproval profile={profile} />
  }

  if (profile.role === "admin") {
    return (
      <AdminDashboard
        profile={profile}
        onLogout={handleLogout}
      />
    )
  }

  if (profile.role === "assigner" || hasTempAssignerAccess) {
    return (
      <AssignerDashboard
        profile={profile}
        onLogout={handleLogout}
        isTemporaryAssigner={
          profile.role === "engineer" && hasTempAssignerAccess
        }
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


  if (authMode === "forgot") {
  return <ForgotPasswordScreen onBackToLogin={() => setAuthMode("login")} />
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
  onForgotPasswordClick={() => setAuthMode("forgot")}
/>
  )
}

export default App