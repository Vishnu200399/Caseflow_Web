import { serve } from "std/http/server.ts"
import { createClient } from "@supabase/supabase-js"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

type DeleteUserBody = {
  adminEmail: string
  profileId: string
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405)
    }

    const body = (await req.json()) as DeleteUserBody
    const { adminEmail, profileId } = body

    if (!adminEmail || !profileId) {
      return jsonResponse({ error: "Missing required fields" }, 400)
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

    // 1. Check delete safety using your SQL function
    const { data: safetyData, error: safetyError } = await supabaseAdmin.rpc(
      "admin_can_delete_user",
      {
        p_admin_email: adminEmail,
        p_profile_id: profileId,
      }
    )

    if (safetyError) {
      return jsonResponse({ error: safetyError.message }, 400)
    }

    const safety = safetyData?.[0]

    if (!safety) {
      return jsonResponse({ error: "Could not verify delete safety" }, 400)
    }

    if (!safety.can_delete) {
      return jsonResponse({ error: safety.reason }, 400)
    }

    // 2. Fetch target profile
    const { data: targetProfile, error: profileFetchError } = await supabaseAdmin
      .from("profiles")
      .select("id, auth_user_id, full_name, email, region_id")
      .eq("id", profileId)
      .single()

    if (profileFetchError || !targetProfile) {
      return jsonResponse({ error: "Target user profile not found" }, 404)
    }

    // 3. Delete related non-history records
    await supabaseAdmin
      .from("temporary_role_requests")
      .delete()
      .or(`engineer_id.eq.${profileId},approved_by.eq.${profileId},rejected_by.eq.${profileId}`)

    await supabaseAdmin
      .from("aux_usage")
      .delete()
      .eq("engineer_id", profileId)

    await supabaseAdmin
      .from("engineer_status")
      .delete()
      .eq("engineer_id", profileId)

    await supabaseAdmin
      .from("signup_requests")
      .delete()
      .or(`created_profile_id.eq.${profileId},approved_by.eq.${profileId}`)

    // 4. Delete CASEFLOW profile
    const { error: profileDeleteError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", profileId)

    if (profileDeleteError) {
      return jsonResponse({ error: profileDeleteError.message }, 400)
    }

    // 5. Delete Auth user if linked
    if (targetProfile.auth_user_id) {
      const { error: authDeleteError } =
        await supabaseAdmin.auth.admin.deleteUser(targetProfile.auth_user_id)

      if (authDeleteError) {
        return jsonResponse(
          {
            error:
              "Profile deleted, but failed to delete auth user: " +
              authDeleteError.message,
          },
          400
        )
      }
    }

    return jsonResponse(
      {
        message: "User deleted successfully",
        deleted_user: {
          profile_id: targetProfile.id,
          full_name: targetProfile.full_name,
          email: targetProfile.email,
        },
      },
      200
    )
  } catch (error) {
    return jsonResponse(
      {
        error:
          error instanceof Error ? error.message : "Unexpected server error",
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