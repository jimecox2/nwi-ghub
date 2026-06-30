// Role-Based Access Control for pubsets and dashboard sources.
//
// Ported from the legacy migration-staging/lib/auth/rbac.js, but adapted from a
// NextAuth `session` to a plain `user` object: { email, primary_role,
// customer_id }. Resolve that user with lib/auth/session.js (server) or read it
// from the auth store (client). This module is pure — no next/navigation, no
// cookies — so it can run in route handlers, server components, and the browser.
//
// Note: both the user and the timebar/pubset use lowercase `customer_id` in this
// codebase (the pubset fetch maps Strapi's `Customer_id` down to `customer_id`).

export const ROLES = {
  ADMIN: "Administrator",
  PROJECT_MANAGER: "Project Manager",
  EXECUTIVE: "Executive",
  TEAM_MEMBER: null,
};

/**
 * Can `user` view a given pubset/timebar row?
 *
 * Rules:
 * 1. Owner always has access to their own pubsets.
 * 2. Users without primary_role OR customer_id only see their own pubsets.
 * 3. Administrator with matching customer_id sees all pubsets for that customer.
 * 4. Project Manager: customer_id matches AND email is in grant_pm_access_to.
 * 5. Team Member: customer_id matches AND email is in grant_tm_access_to.
 * 6. Otherwise no access.
 */
export function hasAccessToPubset(user, timebar) {
  if (!user || !user.email || !timebar) return false;

  const { email, primary_role, customer_id } = user;

  // Rule 1: owner always has access.
  if (timebar.owner === email) return true;

  // Rule 2: no role or no customer → own pubsets only.
  if (!primary_role || !customer_id) return false;

  const sameCustomer = customer_id === timebar.customer_id;

  // Rule 3: Administrator sees everything for their customer.
  if (primary_role?.toLowerCase() === "administrator" && sameCustomer) {
    return true;
  }

  // Rule 4: Project Manager grant list.
  if (primary_role === "Project Manager" && sameCustomer && timebar.grant_pm_access_to) {
    const granted = timebar.grant_pm_access_to
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    if (granted.includes(email)) return true;
  }

  // Rule 5: Team Member grant list.
  if (sameCustomer && timebar.grant_tm_access_to) {
    const granted = timebar.grant_tm_access_to
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    if (granted.includes(email)) return true;
  }

  return false;
}

/** Filter pubsets down to those `user` may view. */
export function filterPubsetsByAccess(pubsets, user) {
  if (!user || !Array.isArray(pubsets)) return [];
  return pubsets.filter((pubset) => hasAccessToPubset(user, pubset));
}

/** Legacy "can publish": Administrator or Project Manager only. */
export function canPublish(user) {
  if (!user) return false;
  const role = user.primary_role;
  return role?.toLowerCase() === "administrator" || role === "Project Manager";
}

/**
 * Who may create / share dashboard sources (matches the legacy
 * DashboardSourceSelector): Administrator, Project Manager, or Executive.
 */
export function canManageDashboardSources(user) {
  if (!user) return false;
  return ["Administrator", "Project Manager", "Executive"].includes(user.primary_role);
}

/**
 * Who may delete a dashboard source: Administrators can delete any; Project
 * Managers and Executives can delete sources they own.
 */
export function canDeleteDashboardSource(user, source) {
  if (!user || !source) return false;
  if (user.primary_role === "Administrator") return true;
  if (user.primary_role === "Project Manager" || user.primary_role === "Executive") {
    return source.owner === user.email;
  }
  return false;
}

/**
 * Who may manage a pubset's access grants (grant_pm_access_to /
 * grant_tm_access_to): the system admin, or an Administrator whose customer
 * matches the pubset. Owners/PMs cannot reassign access.
 */
export function canManagePubsetAccess(user, pubset) {
  if (!user || !pubset) return false;
  if (isSystemAdmin(user)) return true;
  return isAdministrator(user) && user.customer_id === pubset.customer_id;
}

export function getCustomerId(user) {
  return user?.customer_id || null;
}

export function isAdministrator(user) {
  return user?.primary_role?.toLowerCase() === "administrator";
}

export function isProjectManager(user) {
  return user?.primary_role === "Project Manager";
}

export function isExecutive(user) {
  return user?.primary_role === "Executive";
}

/** Legacy hardcoded system-admin check (separate from customer Administrator). */
export function isSystemAdmin(user) {
  return user?.email === "jcox@tbcox.com";
}

export function getRoleDisplayName(role) {
  if (!role) return "Team Member";
  if (role?.toLowerCase() === "administrator") return "Administrator";
  if (role === "Project Manager") return "Project Manager";
  if (role === "Executive") return "Executive";
  return "Team Member";
}

export function getRoleBadgeClass(role) {
  if (role?.toLowerCase() === "administrator") {
    return "bg-red-100 text-red-800 border-red-200";
  }
  if (role === "Project Manager") {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }
  if (role === "Executive") {
    return "bg-purple-100 text-purple-800 border-purple-200";
  }
  return "bg-gray-100 text-gray-800 border-gray-200";
}
