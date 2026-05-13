import { useState } from "react"
import { updatePassword, signOut } from "../lib/auth"

type Props = {
    onPasswordUpdated: () => void
}

export function ResetPasswordScreen({ onPasswordUpdated }: Props) {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")
    const [updating, setUpdating] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleUpdatePassword = async () => {
        setMessage("")
        setError("")

        if (!password || !confirmPassword) {
            setError("Please fill both password fields.")
            return
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setUpdating(true)

        const { error } = await updatePassword(password)

        setUpdating(false)

        if (error) {
            setError(error.message)
            return
        }

        setMessage("Password updated successfully. You can login again now.")

        await signOut()

        setTimeout(() => {
            onPasswordUpdated()
        }, 1500)
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
            <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
                <p className="text-sm font-medium text-blue-600">CASEFLOW</p>

                <h1 className="mt-2 text-2xl font-bold text-slate-900">
                    Reset Password
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Enter your new password below.
                </p>

                <div className="mt-6 space-y-4">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password"
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm New Password"
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input  
                        type="checkbox"
                        checked={showPassword}
                        onChange={(e) => setShowPassword(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300"
                    />
                    Show password
                </label>

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
                    onClick={handleUpdatePassword}
                    disabled={updating}
                    className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                    {updating ? "Updating..." : "Update Password"}
                </button>
            </section>
        </main>
    )
}