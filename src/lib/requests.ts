import { supabase } from "./supabase"

export type SignupRequest = {
  id: string
  full_name: string
  email: string
  username: string | null
  requested_shift: string | null
  requested_project: string | null
  status: "pending" | "approved" | "rejected" | "expired"
  created_at: string
  requested_region_id: string
}

export async function getSignupRequests(regionId: string) {
  const { data, error } = await supabase
    .from("signup_requests")
    .select(`
      id,
      full_name,
      email,
      username,
      requested_shift,
      requested_project,
      status,
      created_at,
      requested_region_id
    `)
    .eq("requested_region_id", regionId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  return { data: data as SignupRequest[] | null, error }
}

export async function approveSignupRequest(
  requestId: string,
  approverProfileId: string
) {
  const { data, error } = await supabase.rpc("approve_signup_request", {
    p_request_id: requestId,
    p_approved_by: approverProfileId,
  })

  return { data, error }
}

export async function rejectSignupRequest(
  requestId: string,
  approverProfileId: string
) {
  const { data, error } = await supabase
    .from("signup_requests")
    .update({
      status: "rejected",
      rejected_by: approverProfileId,
      rejected_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .select()
    .single()

  return { data, error }
}