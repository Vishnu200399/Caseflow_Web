import { supabase } from "./supabase"

export async function requestTemporaryAssigner(params: {
  engineerEmail: string
  regionCode: string
  reason?: string
}) {
  const { data, error } = await supabase.rpc("request_temporary_assigner", {
    p_engineer_email: params.engineerEmail,
    p_region_code: params.regionCode,
    p_reason: params.reason || null,
  })

  return { data, error }
}

export async function approveTemporaryAssigner(params: {
  requestId: string
  approverEmail: string
}) {
  const { data, error } = await supabase.rpc("approve_temporary_assigner", {
    p_request_id: params.requestId,
    p_approver_email: params.approverEmail,
  })

  return { data, error }
}

export async function rejectTemporaryAssigner(params: {
  requestId: string
  rejectorEmail: string
  reason?: string
}) {
  const { data, error } = await supabase.rpc("reject_temporary_assigner", {
    p_request_id: params.requestId,
    p_rejector_email: params.rejectorEmail,
    p_reason: params.reason || null,
  })

  return { data, error }
}

export async function hasActiveAssignerAccess(params: {
  email: string
  regionCode: string
}) {
  const { data, error } = await supabase.rpc("has_active_assigner_access", {
    p_email: params.email,
    p_region_code: params.regionCode,
  })

  return { data, error }
}

export async function getTemporaryAssignerRequests(regionCode: string) {
  const { data, error } = await supabase
    .from("temporary_role_requests")
    .select(`
      id,
      status,
      reason,
      requested_at,
      expires_at,
      engineer:profiles!temporary_role_requests_engineer_id_fkey (
        full_name,
        email
      )
    `)
    .eq("status", "pending")
    .order("requested_at", { ascending: false })

  return { data, error }
}

export async function getActiveTemporaryAssignerAccess(params: {
  email: string
  regionCode: string
}) {
  const { data, error } = await supabase
    .from("temporary_role_requests")
    .select(`
      id,
      status,
      expires_at,
      approved_at,
      engineer:profiles!temporary_role_requests_engineer_id_fkey (
        full_name,
        email
      )
    `)
    .eq("status", "approved")
    .gt("expires_at", new Date().toISOString())
    .order("approved_at", { ascending: false })
    .limit(1)

  return { data, error }
}