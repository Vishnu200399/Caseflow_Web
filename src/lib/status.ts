import { supabase } from "./supabase"

export type ManualEngineerStatus =
  | "available"
  | "leave"
  | "training"
  | "out_of_shift"
  | "it_issue"
  | "week_off"
  | "sick_leave"

export async function setEngineerStatus(params: {
  actorEmail: string
  engineerEmail: string
  regionCode: string
  status: ManualEngineerStatus
}) {
  const { data, error } = await supabase.rpc("set_engineer_status", {
    p_actor_email: params.actorEmail,
    p_engineer_email: params.engineerEmail,
    p_region_code: params.regionCode,
    p_status: params.status,
  })

  return { data, error }
}

export const statusOptions: {
  value: ManualEngineerStatus
  label: string
}[] = [
  { value: "available", label: "Available" },
  { value: "leave", label: "Leave" },
  { value: "training", label: "Training" },
  { value: "out_of_shift", label: "Out of Shift" },
  { value: "it_issue", label: "IT Issue" },
  { value: "week_off", label: "Week Off" },
  { value: "sick_leave", label: "Sick Leave" },
]