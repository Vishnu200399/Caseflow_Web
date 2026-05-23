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
  has_temp_assigner_access: boolean
temp_assigner_expires_at: string | null
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

export async function adminUpdateUser(params: {
  adminEmail: string
  profileId: string
  role?: "engineer" | "assigner" | "admin" | null
  regionCode?: string | null
  isActive?: boolean | null
  isApproved?: boolean | null
  displayOrder?: number | null
}) {
  const { data, error } = await supabase.rpc("admin_update_user", {
    p_admin_email: params.adminEmail,
    p_profile_id: params.profileId,
    p_role: params.role ?? null,
    p_region_code: params.regionCode ?? null,
    p_is_active: params.isActive ?? null,
    p_is_approved: params.isApproved ?? null,
    p_display_order: params.displayOrder ?? null,
  })

  return { data, error }
}

export async function adminRemoveTemporaryAssigner(params: {
  adminEmail: string
  profileId: string
}) {
  const { data, error } = await supabase.rpc("admin_remove_temporary_assigner", {
    p_admin_email: params.adminEmail,
    p_profile_id: params.profileId,
  })

  return { data, error }
}

export async function adminCreateUser(params: {
  adminEmail: string
  fullName: string
  email: string
  password: string
  role: "engineer" | "assigner" | "admin"
  regionCode: "APAC" | "EMEA" | "AMS"
  displayOrder?: number | null
}) {
  const { data, error } = await supabase.functions.invoke("admin-create-user", {
    body: {
      adminEmail: params.adminEmail,
      fullName: params.fullName,
      email: params.email,
      password: params.password,
      role: params.role,
      regionCode: params.regionCode,
      displayOrder: params.displayOrder ?? null,
    },
  })

  return { data, error }
}

export async function adminDeleteUser(params: {
  adminEmail: string
  profileId: string
}) {
  const { data, error } = await supabase.functions.invoke("admin-delete-user", {
    body: {
      adminEmail: params.adminEmail,
      profileId: params.profileId,
    },
  })

  if (error) {
    let message = error.message

    const context = (error as any).context

    if (context) {
      try {
        const body = await context.json()
        message = body?.error || message
      } catch {
        // keep default message
      }
    }

    return {
      data: null,
      error: new Error(message),
    }
  }

  return { data, error: null }
}