import { supabase } from "./supabase"

export async function getEngineersWithCounts(regionCode: string) {
  const { data, error } = await supabase.rpc("get_engineers_with_counts", {
    p_region_code: regionCode,
  })

  return { data, error }
}

export async function getSuggestedEngineer(regionCode: string) {
  const { data, error } = await supabase.rpc("get_suggested_engineer", {
    p_region_code: regionCode,
  })

  return { data, error }
}

export async function assignCase(params: {
  caseNumber: string
  regionCode: string
  assignedByEmail: string
  isOverride?: boolean
  overrideEngineerEmail?: string | null
}) {
  const { data, error } = await supabase.rpc("assign_case", {
    p_case_number: params.caseNumber,
    p_region_code: params.regionCode,
    p_assigned_by_email: params.assignedByEmail,
    p_is_override: params.isOverride || false,
    p_override_engineer_email: params.overrideEngineerEmail || null,
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

export async function getExcelView(regionCode: string) {
  const { data, error } = await supabase.rpc("get_excel_case_view", {
    p_region_code: regionCode,
  })

  return { data, error }
}