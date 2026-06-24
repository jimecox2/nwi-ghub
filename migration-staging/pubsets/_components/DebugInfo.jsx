'use client';
import { useState } from 'react';

/**
 * Access Analysis component to show session info and access control details
 * Helps users understand why they can or cannot see specific pubsets
 */
export default function DebugInfo({ session, allPubsets, accessiblePubsets }) {
  const [showDebug, setShowDebug] = useState(false);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="mb-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
      >
        Show Access Analysis
      </button>
    );
  }

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4 text-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-blue-900">Access Analysis</h3>
          <p className="text-sm text-blue-700 mt-1">
            This panel shows which pubsets you can access and why, based on your role and permissions.
          </p>
        </div>
        <button
          onClick={() => setShowDebug(false)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
        >
          Hide Access Analysis
        </button>
      </div>

      {/* Session Info */}
      <div className="bg-white p-3 rounded border border-blue-200">
        <h4 className="font-semibold mb-2 text-blue-900">Your Access Credentials:</h4>
        <div className="space-y-1 text-xs">
          <div><strong>Email:</strong> {session.user.email}</div>
          <div><strong>Customer ID:</strong> {session.user.customer_id || 'Not assigned (you can only see your own pubsets)'}</div>
          <div><strong>Role:</strong> {session.user.primary_role || 'Not assigned (you can only see your own pubsets)'}</div>
        </div>
      </div>

      {/* Pubsets Info */}
      <div className="bg-white p-3 rounded border border-blue-200">
        <h4 className="font-semibold mb-2 text-blue-900">All Available Pubsets ({allPubsets.length}):</h4>
        <p className="text-xs text-gray-600 mb-2">These are all pubsets in the system that match your query.</p>
        <div className="space-y-2 max-h-60 overflow-auto">
          {allPubsets.map((pubset, idx) => (
            <div key={idx} className="text-xs border-b pb-2">
              <div><strong>ID:</strong> {pubset.id}</div>
              <div><strong>Name:</strong> {pubset.name}</div>
              <div><strong>Owner:</strong> {pubset.owner}</div>
              <div><strong>Customer ID:</strong> {pubset.customer_id || 'NULL'}</div>
              <div><strong>PM Grants:</strong> {pubset.grant_pm_access_to || 'NULL'}</div>
              <div><strong>TM Grants:</strong> {pubset.grant_tm_access_to || 'NULL'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Access Control Results */}
      <div className="bg-white p-3 rounded border border-blue-200">
        <h4 className="font-semibold mb-2 text-blue-900">
          Access Control Results ({accessiblePubsets.length} accessible):
        </h4>
        <p className="text-xs text-gray-600 mb-2">
          Each pubset is evaluated against your credentials to determine access. Green = granted, Red = denied.
        </p>
        <div className="space-y-2 max-h-60 overflow-auto">
          {allPubsets.map((pubset, idx) => {
            const hasAccess = accessiblePubsets.some(p => p.id === pubset.id);
            const isOwner = pubset.owner === session.user.email;
            const hasRoleAndCustomerId = session.user.primary_role && session.user.customer_id;
            const isAdmin = session.user.primary_role === 'administrator';
            const customerMatch = session.user.customer_id && session.user.customer_id === pubset.customer_id;
            const isPM = session.user.primary_role === 'Project Manager';
            const inPmGrant = pubset.grant_pm_access_to?.split(',').map(e => e.trim()).includes(session.user.email);
            const inTmGrant = pubset.grant_tm_access_to?.split(',').map(e => e.trim()).includes(session.user.email);

            return (
              <div
                key={idx}
                className={`text-xs border-b pb-2 ${hasAccess ? 'bg-green-50' : 'bg-red-50'} p-2 rounded`}
              >
                <div className="font-semibold">
                  {pubset.name} - {hasAccess ? '✅ GRANTED' : '❌ DENIED'}
                </div>
                <div className="ml-2 space-y-1 mt-1">
                  <div>Owner ({pubset.owner}): {isOwner ? '✅ YES' : '❌ NO'}</div>
                  <div>User has role & customer ID: {hasRoleAndCustomerId ? '✅ YES' : '❌ NO (can only see own pubsets)'}</div>
                  {hasRoleAndCustomerId && (
                    <>
                      <div>Is Administrator: {isAdmin ? '✅ YES' : '❌ NO'}</div>
                      {isAdmin && (
                        <div className="ml-2">
                          Customer Match ({session.user.customer_id} === {pubset.customer_id}): {customerMatch ? '✅ YES' : '❌ NO'}
                        </div>
                      )}
                      <div>Is PM: {isPM ? '✅ YES' : '❌ NO'}</div>
                      {isPM && (
                        <div className="ml-2">In PM grant: {inPmGrant ? '✅ YES' : '❌ NO'}</div>
                      )}
                      <div>In TM grant: {inTmGrant ? '✅ YES' : '❌ NO'}</div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
