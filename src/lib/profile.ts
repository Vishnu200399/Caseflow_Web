import { supabase } from "./supabase"

export type UserProfile = {
  id: string
  auth_user_id: string
  full_name: string
  email: string
  role: "engineer" | "assigner"
  is_approved: boolean
  is_active: boolean
  region_id: string
  regions: {
    code: string
    name: string
  } | null
}

export async function getCurrentProfile() {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return { profile: null, error: userError }
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      auth_user_id,
      full_name,
      email,
      role,
      is_approved,
      is_active,
      region_id,
      regions (
        code,
        name
      )
    `)
    .eq("auth_user_id", userData.user.id)
    .single()

  const normalizedProfile = data
    ? {
        ...data,
        regions: Array.isArray(data.regions)
          ? data.regions[0] ?? null
          : data.regions,
      }
    : null

  return { profile: normalizedProfile as UserProfile | null, error }
}