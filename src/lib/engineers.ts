import { supabase } from "./supabase"

export async function getEngineersWithCounts(regionCode: string) {
  const { data, error } = await supabase.rpc("get_engineers_with_counts", {
    p_region_code: regionCode,
  })

  return { data, error }
}

export async function getSuggestedEngineer(regionCode: string) {
  const { data, error } = await supabase.rpc("get_next_engineer", {
    p_region_code: regionCode,
  })

  return { data, error }
}

export async function assignCase(
  caseNumber: string,
  regionCode: string,
  assignerEmail: string,
  override = false,
  overrideEngineerEmail?: string
) {
  const { data, error } = await supabase.rpc("assign_case", {
    p_case_number: caseNumber,
    p_region_code: regionCode,
    p_assigned_by_email: assignerEmail,
    p_override: override,
    p_override_engineer_email: overrideEngineerEmail,
  })

  return { data, error }
}

export async function startAux(
  email: string,
  regionCode: string,
  type: "AUX1" | "AUX4"
) {
  const { data, error } = await supabase.rpc("start_aux", {
    p_engineer_email: email,
    p_region_code: regionCode,
    p_aux_type: type,
  })

  return { data, error }
}

export async function endAux(email: string, regionCode: string) {
  const { data, error } = await supabase.rpc("end_aux", {
    p_engineer_email: email,
    p_region_code: regionCode,
  })

  return { data, error }
}

