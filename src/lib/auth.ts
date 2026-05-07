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
  regionId: string
  shift: string
  project: string
}

export const createSignupRequest = async (payload: SignupRequestPayload) => {
  return await supabase.from("signup_requests").insert({
    full_name: payload.fullName,
    email: payload.email,
    username: payload.username,
    requested_region_id: payload.regionId,
    requested_shift: payload.shift,
    requested_project: payload.project,
    status: "pending",
  })
}