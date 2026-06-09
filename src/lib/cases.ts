import { supabase } from "./supabase"

export type MyCase = {
  assignment_id: string
  case_number: string
  assigned_at: string
  assigned_by_name: string | null
  processing_status: "pending" | "processed" | "unprocessed"
  processing_updated_at: string | null
}

export async function getMyCases(engineerEmail: string) {
  const { data, error } = await supabase.rpc("get_my_cases", {
    p_engineer_email: engineerEmail,
  })

  if (error) {
    return { data: null, error }
  }

  return { data: data as MyCase[], error: null }
}

export async function updateCaseProcessingStatus(params: {
  engineerEmail: string
  assignmentId: string
  processingStatus: "processed" | "unprocessed"
}) {
  const { data, error } = await supabase.rpc("update_case_processing_status", {
    p_engineer_email: params.engineerEmail,
    p_assignment_id: params.assignmentId,
    p_processing_status: params.processingStatus,
  })

  if (error) {
    return { data: null, error }
  }

  return { data, error: null }
}

export type RegionCaseProcessingStat = {
  engineer_id: string
  engineer_name: string
  engineer_email: string
  total_cases: number
  processed_cases: number
  unprocessed_cases: number
  pending_cases: number
}

export async function getRegionCaseProcessingStats(params: {
  actorEmail: string
  regionCode: string
}) {
  const { data, error } = await supabase.rpc(
    "get_region_case_processing_stats",
    {
      p_actor_email: params.actorEmail,
      p_region_code: params.regionCode,
    }
  )

  if (error) {
    return { data: null, error }
  }

  return {
    data: data as RegionCaseProcessingStat[],
    error: null,
  }
}