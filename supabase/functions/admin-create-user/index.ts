import { serve } from "std/http/server.ts"
import { createClient } from "@supabase/supabase-js"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

type CreateUserBody = {
  adminEmail: string
  fullName: string
  email: string
  password: string
  role: "engineer" | "assigner" | "admin"
  regionCode: "APAC" | "EMEA" | "AMS"
  displayOrder?: number | null
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405)
    }

    const body = (await req.json()) as CreateUserBody

    const {
      adminEmail,
      fullName,
      email,
      password,
      role,
      regionCode,
      displayOrder,
    } = body

    if (!adminEmail || !fullName || !email || !password || !role || !regionCode) {
      return jsonResponse({ error: "Missing required fields" }, 400)
    }

    if (!["engineer", "assigner", "admin"].includes(role)) {
      return jsonResponse({ error: "Invalid role" }, 400)
    }

    if (!["APAC", "EMEA", "AMS"].includes(regionCode)) {
      return jsonResponse({ error: "Invalid region" }, 400)
    }

    if (password.length < 8) {
      return jsonResponse(
        { error: "Password must be at least 8 characters" },
        400
      )
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse(
        { error: "Missing Supabase environment variables" },
        500
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // 1. Validate admin
    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, role, is_active, is_approved")
      .ilike("email", adminEmail)
      .eq("role", "admin")
      .eq("is_active", true)
      .eq("is_approved", true)
      .single()

    if (adminError || !adminProfile) {
      return jsonResponse(
        { error: "Only active admins can create users" },
        403
      )
    }

    // 2. Get region
    const { data: region, error: regionError } = await supabaseAdmin
      .from("regions")
      .select("id, code, name")
      .eq("code", regionCode)
      .single()

    if (regionError || !region) {
      return jsonResponse({ error: "Region not found" }, 404)
    }

    // 3. Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .ilike("email", email)
      .maybeSingle()

    if (existingProfile) {
      return jsonResponse(
        { error: "A CASEFLOW profile already exists for this email" },
        409
      )
    }

    // 4. Create Supabase Auth user
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role,
          region: regionCode,
        },
      })

    if (authError || !authData.user) {
      return jsonResponse(
        { error: authError?.message || "Failed to create auth user" },
        400
      )
    }

   const authUserId = authData.user.id
const profileId = crypto.randomUUID()

// 5. Create CASEFLOW profile
const { data: newProfile, error: profileError } = await supabaseAdmin
  .from("profiles")
  .insert({
    id: profileId,
    auth_user_id: authUserId,
    full_name: fullName,
    email,
    role,
    region_id: region.id,
    is_approved: true,
    is_active: true,
    display_order: displayOrder ?? null,
  })
      .select("id, full_name, email, role, region_id")
      .single()

    if (profileError || !newProfile) {
      // Rollback auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUserId)

      return jsonResponse(
        { error: profileError?.message || "Failed to create profile" },
        400
      )
    }

    // 6. Create engineer_status if role is engineer
    if (role === "engineer") {
      const { error: statusError } = await supabaseAdmin
        .from("engineer_status")
        .insert({
          engineer_id: newProfile.id,
          region_id: region.id,
          status: "available",
          status_changed_at: new Date().toISOString(),
        })

      if (statusError) {
        return jsonResponse(
          {
            error:
              "User created, but failed to create engineer status: " +
              statusError.message,
          },
          400
        )
      }
    }

    return jsonResponse(
      {
        message: "User created successfully",
        user: {
          profile_id: newProfile.id,
          auth_user_id: authUserId,
          full_name: newProfile.full_name,
          email: newProfile.email,
          role: newProfile.role,
          region_code: region.code,
        },
      },
      200
    )
  } catch (error) {
    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error",
      },
      500
    )
  }
})

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  })
}