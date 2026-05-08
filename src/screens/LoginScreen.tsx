type LoginScreenProps = {
  email: string
  password: string
  error: string
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onLogin: () => void
  onSignupClick: () => void
  onForgotPasswordClick: () => void
}

export function LoginScreen({
  email,
  password,
  error,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onSignupClick,
  onForgotPasswordClick
}: LoginScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-blue-600">CASEFLOW</p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Sign in to your dashboard
        </h1>

        <div className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border border-slate-200 p-3 outline-none focus:border-blue-500"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-lg border border-slate-200 p-3 outline-none focus:border-blue-500"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
          />

          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Forgot password?
          </button>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={onLogin}
            className="w-full rounded-lg bg-blue-600 p-3 font-medium text-white hover:bg-blue-700"
          >
            Sign In
          </button>
          <button
            onClick={onSignupClick}
            className="w-full rounded-lg border border-slate-200 p-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            New to CASEFLOW? Request Access
          </button>
        </div>
      </div>
    </main>
  )
}