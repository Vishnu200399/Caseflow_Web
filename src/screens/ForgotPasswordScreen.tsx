import { useState } from "react"
import { sendPasswordResetEmail } from "../lib/auth"

type Props = {
  onBackToLogin: () => void
}

export function ForgotPasswordScreen({ onBackToLogin }: Props) {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    setMessage("")
    setError("")

    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail) {
      setError("Please enter your email.")
      return
    }

    setSending(true)

    const { error } = await sendPasswordResetEmail(cleanEmail)

    setSending(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage("Password reset link sent. Please check your email.")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-blue-600">CASEFLOW</p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Forgot Password
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Enter your registered email. We’ll send a secure password reset link.
        </p>

        <input
          type="email"
          placeholder="Email address"
          autoComplete="off"
          className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

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

        <button
          onClick={handleSend}
          disabled={sending}
          className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {sending ? "Sending..." : "Send Reset Link"}
        </button>

        <button
          onClick={onBackToLogin}
          className="mt-3 w-full rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to Login
        </button>
      </section>
    </main>
  )
}