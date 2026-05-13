import { supabase } from "./supabase"

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}

export const getSession = async () => {
  return await supabase.auth.getSession()
}   

export type SignupRequestPayload = {
  fullName: string
  email: string
  username: string
  password: string
  regionId: string
  requestedRole: "engineer" | "assigner"
}

export const createSignupRequest = async (payload: SignupRequestPayload) => {
  const { error: authError } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
  })

  if (authError) {
    return { data: null, error: authError }
  }

  return await supabase.from("signup_requests").insert({
    full_name: payload.fullName,
    email: payload.email,
    username: payload.username,
    requested_region_id: payload.regionId,
    requested_role: payload.requestedRole,
    status: "pending",
  })
}

export const sendPasswordResetEmail = async (email: string) => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  })
}

export const updatePassword = async (newPassword: string) => {
  return await supabase.auth.updateUser({
    password: newPassword,
  })
}