import { supabase } from "./supabase"

export type Region = {
  id: string
  code: string
  name: string
}

export async function getRegions() {
  const { data, error } = await supabase
    .from("regions")
    .select("id, code, name")
    .order("code")

  return { data: data as Region[] | null, error }
}