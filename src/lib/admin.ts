import { supabase } from "./supabase"

export type AdminUser = {
  profile_id: string
  auth_user_id: string | null
  full_name: string
  email: string
  role: "engineer" | "assigner" | "admin"
  region_id: string | null
  region_code: string | null
  region_name: string | null
  is_approved: boolean
  is_active: boolean
  display_order: number | null
  auth_linked: boolean
}

export async function getAdminUsers(adminEmail: string) {
  const { data, error } = await supabase.rpc("get_admin_users", {
    p_admin_email: adminEmail,
  })

  return {
    data: (data || []) as AdminUser[],
    error,
  }
}