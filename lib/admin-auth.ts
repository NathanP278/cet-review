import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type AdminLevel = 10 | 50 | 80 | 100;

export interface AdminRole {
  id: string;
  name: string;
  level: AdminLevel;
}

/**
 * Validates that the current user has an admin role of at least the required level.
 * If they do not, they are immediately redirected away.
 * Returns the admin role and the Supabase client for further querying.
 */
export async function requireAdmin(minimumLevel: AdminLevel = 10) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the user's assigned admin role
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role_id, admin_roles(id, name, level)")
    .eq("user_id", user.id)
    .single();

  if (!userRole || !userRole.admin_roles) {
    // Standard student user attempting to access admin area
    redirect("/dashboard");
  }

  const role = userRole.admin_roles as any as AdminRole;

  if (role.level < minimumLevel) {
    // Has a role, but not high enough (e.g., Moderator trying to access Super Admin route)
    redirect("/admin"); // Redirect to basic admin dashboard instead of student dashboard
  }

  return { user, role, supabase };
}

/**
 * Appends a highly secure audit log to the database.
 * Used internally by Admin Server Actions.
 */
export async function logAdminAction(
  supabase: any,
  adminId: string,
  action: string,
  resource: string,
  resourceId?: string,
  oldValue?: any,
  newValue?: any
) {
  try {
    await supabase.from("admin_audit_logs").insert({
      admin_id: adminId,
      action,
      resource,
      resource_id: resourceId,
      old_value: oldValue || null,
      new_value: newValue || null,
    });
  } catch (error) {
    console.error("CRITICAL: Failed to write audit log:", error);
    // Depending on security requirements, we might want to throw here to fail the action
    // if the audit log fails to write. For MVP, we'll log it.
  }
}
