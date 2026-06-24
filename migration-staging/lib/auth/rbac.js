// lib/auth/rbac.js
// Role-Based Access Control (RBAC) Helper Functions

import { auth } from '@/auth/auth'
import { redirect } from 'next/navigation'

/**
 * Role definitions for the RBAC system
 */
export const ROLES = {
  ADMIN: 'Administrator',
  PROJECT_MANAGER: 'Project Manager',
  TEAM_MEMBER: null  // or any other value
}

/**
 * Check if user has access to a pubset/timebar row
 *
 * RBAC Rules:
 * 1. Owner always has access to their own pubsets
 * 2. Users without primary_role OR customer_id only see their own pubsets
 * 3. Administrator with customer_id sees all pubsets with matching customer_id
 * 4. Project Manager with customer_id sees pubsets where BOTH customer_id matches AND email is in grant_pm_access_to
 * 5. Team Members with customer_id see pubsets where BOTH customer_id matches AND email is in grant_tm_access_to
 * 6. If no grants exist, only owner sees the pubset
 *
 * @param {Object} session - NextAuth session
 * @param {Object} timebar - Timebar item with owner, grant_pm_access_to, grant_tm_access_to, customer_id
 * @returns {boolean}
 *
 * @example
 * const canView = hasAccessToPubset(session, {
 *   owner: 'user@example.com',
 *   customer_id: 'XYZCUST',
 *   grant_pm_access_to: 'pm1@example.com,pm2@example.com',
 *   grant_tm_access_to: 'tm1@example.com,tm2@example.com'
 * })
 */
export function hasAccessToPubset(session, timebar) {
  if (!session || !session.user) return false

  const { email, primary_role, customer_id } = session.user

  // Rule 1: Owner always has access
  if (timebar.owner === email) return true

  // Rule 2: Users without role OR customer_id only see their own pubsets
  if (!primary_role || !customer_id) {
    return false
  }

  // Rule 3: Administrator with matching customer_id sees all pubsets for that customer
  if (primary_role?.toLowerCase() === 'administrator' && customer_id === timebar.customer_id) {
    return true
  }

  // Rule 4: Project Manager - check grant list AND customer_id match
  if (primary_role === 'Project Manager' && customer_id === timebar.customer_id && timebar.grant_pm_access_to) {
    const grantList = timebar.grant_pm_access_to || ''
    const grantedEmails = grantList.split(',').map(e => e.trim()).filter(e => e)
    if (grantedEmails.includes(email)) return true
  }

  // Rule 5: Team Member - check grant list AND customer_id match
  if (customer_id === timebar.customer_id && timebar.grant_tm_access_to) {
    const grantList = timebar.grant_tm_access_to || ''
    const grantedEmails = grantList.split(',').map(e => e.trim()).filter(e => e)
    if (grantedEmails.includes(email)) return true
  }

  // No access granted
  return false
}

/**
 * Filter pubsets based on user's access rights
 *
 * @param {Array} pubsets - Array of timebar/pubset data
 * @param {Object} session - NextAuth session
 * @returns {Array} Filtered pubsets
 *
 * @example
 * const accessiblePubsets = filterPubsetsByAccess(allPubsets, session)
 */
export function filterPubsetsByAccess(pubsets, session) {
  if (!session || !pubsets || !Array.isArray(pubsets)) {
    return []
  }

  return pubsets.filter(pubset => hasAccessToPubset(session, pubset))
}

/**
 * Check if user can publish
 * Only Administrators and Project Managers can publish
 *
 * @param {Object} session - NextAuth session
 * @returns {boolean}
 *
 * @example
 * if (canPublish(session)) {
 *   // Show publish button
 * }
 */
export function canPublish(session) {
  if (!session) return false

  const { primary_role } = session.user

  // Only administrators and Project Managers can publish
  return primary_role?.toLowerCase() === 'administrator' || primary_role === 'Project Manager'
}

/**
 * Get customer ID for current user
 *
 * @param {Object} session - NextAuth session
 * @returns {string|null} Customer ID or null
 */
export function getCustomerId(session) {
  return session?.user?.customer_id || null
}

/**
 * Check if user is administrator
 *
 * @param {Object} session - NextAuth session
 * @returns {boolean}
 */
export function isAdministrator(session) {
  return session?.user?.primary_role?.toLowerCase() === 'administrator'
}

/**
 * Check if user is Project Manager
 *
 * @param {Object} session - NextAuth session
 * @returns {boolean}
 */
export function isProjectManager(session) {
  return session?.user?.primary_role === 'Project Manager'
}

/**
 * Check if user is a system administrator (legacy check)
 *
 * @param {Object} session - NextAuth session
 * @returns {boolean}
 */
export function isSystemAdmin(session) {
  if (!session || !session.user) return false

  // Legacy hardcoded admin check
  if (session.user.email === 'jcox@tbcox.com') {
    return true
  }

  return false // System admin separate from customer administrator
}

/**
 * Get display name for a role
 *
 * @param {string} role - Role value
 * @returns {string} Human-readable role name
 */
export function getRoleDisplayName(role) {
  if (!role) return 'Team Member'
  if (role?.toLowerCase() === 'administrator') return 'Administrator'
  if (role === 'Project Manager') return 'Project Manager'
  return 'Team Member'
}

/**
 * Get badge color class for a role (Tailwind CSS)
 *
 * @param {string} role - Role value
 * @returns {string} Tailwind CSS classes
 */
export function getRoleBadgeClass(role) {
  if (role?.toLowerCase() === 'administrator') {
    return 'bg-red-100 text-red-800 border-red-200'
  }
  if (role === 'Project Manager') {
    return 'bg-blue-100 text-blue-800 border-blue-200'
  }
  return 'bg-gray-100 text-gray-800 border-gray-200'
}

/**
 * Require authentication for a route (use in Server Components)
 *
 * @param {string} callbackUrl - URL to redirect to after signin
 * @returns {Promise<Object>} session - The authenticated session
 * @throws {redirect} Redirects to signin if unauthenticated
 *
 * @example
 * const session = await requireAuth('/dashboard/pubsets')
 */
export async function requireAuth(callbackUrl = '/dashboard') {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin?callbackUrl=' + encodeURIComponent(callbackUrl))
  }

  return session
}
