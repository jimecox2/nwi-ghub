// app/dashboard/pubsets/page.jsx
import { auth } from '@/auth/auth';
import { redirect } from 'next/navigation';
import { filterPubsetsByAccess } from '@/lib/auth/rbac';
import PubsetsDataTable from './_components/PubsetsDataTable';
import DebugInfo from './_components/DebugInfo';
import { API_URL } from '@/config';


/**
 * Fetch all pubsets from Strapi (both connected and not connected)
 * @param {string} jwt - Strapi JWT token
 * @returns {Promise<Array>} Array of pubset objects
 */
const fetchAllPubsets = async (jwt) => {
  try {
    const res = await fetch(
      `${API_URL}/timebars?populate=users_permissions_user`,
      {
        headers: { 'Authorization': `Bearer ${jwt}` },
        cache: 'no-store'
      }
    );

    if (!res.ok) {
      console.error('Failed to fetch pubsets:', res.status, res.statusText);
      return [];
    }

    const data = await res.json();

    // Transform Strapi response to flat structure and filter out empty pubsets
    return data.data
      .filter(item => item.attributes.tb !== null) // Filter out pubsets with null tb field (empty pubsets)
      .map(item => ({
        id: item.id,
        name: item.attributes.name || 'Untitled',
        owner: item.attributes.owner || 'N/A',
        customer_id: item.attributes.Customer_id || null,
        published_date: item.attributes.publishedAt || item.attributes.createdAt,
        users_permissions_user: item.attributes.users_permissions_user?.data?.attributes?.email ||
                                item.attributes.users_permissions_user?.data?.attributes?.username ||
                                'N/A',
        isActive: item.attributes.isActive,
        grant_pm_access_to: item.attributes.grant_pm_access_to || '',
        grant_tm_access_to: item.attributes.grant_tm_access_to || '',
        tbmdjoined: item.attributes.tbmdjoined || null,
        source_product: item.attributes.source_product || null,
        source_product_version: item.attributes.source_product_version || null,
        aggregation_level: item.attributes.aggregation_level || null,
        publish_status: item.attributes.publish_status || null,
        division: item.attributes.division || null,
        cost_center: item.attributes.cost_center || null,
        geographic_region: item.attributes.geographic_region || null,
        source_file_name: item.attributes.source_file_name || null,
        source_file_version: item.attributes.source_file_version || null
      }));
  } catch (error) {
    console.error('Error fetching pubsets:', error);
    return [];
  }
};

/**
 * Enterprise Pubsets Page - Make Sources or Manage pubsets and create dashboard sources
 * Server Component - fetches data and applies RBAC filtering
 */
export default async function PubsetsPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin?callbackUrl=/dashboard/pubsets');
  }

  // Fetch all pubsets from Strapi
  const allPubsets = await fetchAllPubsets(session.jwt);

  // Apply security filtering based on role and grants
  const accessiblePubsets = filterPubsetsByAccess(allPubsets, session);

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Manage Pubsets &amp; Make Dashboard Sources</h1>

        {/* Instructional Text */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2 text-sm text-blue-900">
          <p>
            <strong>Creating Dashboard Sources:</strong> A dashboard source is a consolidated view that combines data from multiple pubsets,
            giving you executive-level insights across all your projects in one place.
          </p>
          <p>
            <strong>How to create:</strong> Use the checkboxes to select the project pubsets you want to analyze together,
            then click the &quot;Generate Dashboard Source&quot; button. You&apos;ll be able to review the combined data before saving it as a dashboard source
            that you can access anytime from the Enterprise Dashboard.
          </p>
          <p className="text-xs text-blue-700">
            Select datasets that are relevant to your analysis needs (e.g., all projects in a division,
            all active projects, or specific portfolios). You can create multiple dashboard sources for different purposes.
          </p>
        </div>

        {/* Link to Enterprise Dashboard Sources */}
        <div className="mt-4">
          <a
            href="/dashboard/sources"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Enterprise Dashboard Sources
          </a>
        </div>
      </div>

      {/* Table Component */}
      <PubsetsDataTable data={accessiblePubsets} session={session} />

      {/* Info Message */}
      {allPubsets.length > 0 && accessiblePubsets.length === 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            <strong>No pubsets available.</strong> You don&apos;t have access to any published datasets.
            Contact your administrator if you believe this is incorrect.
          </p>
        </div>
      )}

      {/* RBAC Explanation Section */}
      <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Understanding Access Control (RBAC)</h2>

        <div className="space-y-4 text-sm text-gray-700">
          <p>
            This page uses <strong>Role-Based Access Control (RBAC)</strong> to determine which published datasets (pubsets) you can view.
            Your access is based on your role, customer ID, and specific grant permissions from Project Managers.
          </p>

          <p>
            <strong>Don&apos;t see a pubset you expect?</strong> If you believe you should have access to a specific dataset but don&apos;t see it listed,
            use the <strong>&quot;Show Access Analysis&quot;</strong> button below to see detailed information about why you can or cannot access each pubset.
            This tool helps you understand the RBAC rules in action and identify what permissions you may need. Contact your Project Manager
            or Administrator to request access to specific datasets.
          </p>

          {/* Show Access Analysis Button */}
          <div className="my-4">
            <DebugInfo
              session={session}
              allPubsets={allPubsets}
              accessiblePubsets={accessiblePubsets}
            />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Access Rules Summary:</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Owner:</strong> You always have access to pubsets you created.
              </li>
              <li>
                <strong>Administrator:</strong> Administrators can see all pubsets within their customer organization.
              </li>
              <li>
                <strong>Project Manager:</strong> Project Managers can see pubsets where they are granted access via the PM grant list.
              </li>
              <li>
                <strong>Team Member:</strong> Team members can see pubsets where they are granted access via the Team Member grant list.
              </li>
              <li>
                <strong>No Role/Grants:</strong> Users without roles or grant permissions can only see their own pubsets.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metadata for the page
export const metadata = {
  title: 'Manage Pubsets | Enterprise Dashboard',
  description: 'Manage published datasets and create enterprise dashboard sources',
};
