// app/dashboard/pubsets/consolidated/page.jsx
import { auth } from "@/auth/auth"
import { redirect } from "next/navigation"
import { API_URL } from '@/config/index';
import ConsolidatedReportComponent from "@/components/Dashboard/Reports/ConsolidatedReportComponent.jsx"
import IncludedPubsetsSection from "./_components/IncludedPubsetsSection"

/**
 * Fetch multiple pubsets by IDs
 * @param {string} ids - Comma-separated pubset IDs
 * @param {string} jwt - Auth token
 * @returns {Promise<Array>} Array of pubset data
 */
const fetchPubsetsByIds = async (ids, jwt) => {
  const idArray = ids.split(',').map(id => id.trim()).filter(id => id);

  if (idArray.length === 0) {
    return [];
  }

  try {
    const promises = idArray.map(id =>
      fetch(
        `${API_URL}/timebars/${id}?fields[0]=name&fields[1]=owner&fields[2]=tbmdjoined&fields[3]=source_product&fields[4]=publish_status&fields[5]=aggregation_level&fields[6]=division&fields[7]=cost_center&fields[8]=geographic_region&fields[9]=tbresources&fields[10]=tbtags&fields[11]=tbcharts`,
        {
          headers: { 'Authorization': `Bearer ${jwt}` },
          cache: 'no-store'
        }
      )
    );

    const responses = await Promise.all(promises);
    const pubsets = [];

    for (let i = 0; i < responses.length; i++) {
      const res = responses[i];

      if (!res.ok) {
        console.error(`Failed to fetch pubset ${idArray[i]}:`, res.status, res.statusText);
        continue;
      }

      const data = await res.json();

      pubsets.push({
        id: data.data.id,
        name: data.data.attributes.name || 'Untitled',
        owner: data.data.attributes.owner || 'N/A',
        tbmdjoined: data.data.attributes.tbmdjoined || null,
        tbresources: data.data.attributes.tbresources || null,
        tbtags: data.data.attributes.tbtags || null,
        tbcharts: data.data.attributes.tbcharts || null,
        source_product: data.data.attributes.source_product || null,
        publish_status: data.data.attributes.publish_status || null,
        aggregation_level: data.data.attributes.aggregation_level || null,
        division: data.data.attributes.division || null,
        cost_center: data.data.attributes.cost_center || null,
        geographic_region: data.data.attributes.geographic_region || null
      });
    }

    return pubsets;
  } catch (error) {
    console.error('Error fetching pubsets:', error);
    return [];
  }
};

/**
 * Merge pubset data from multiple pubsets.
 * Prefix each item's tbID with its source pubset ID (e.g., "25-A01")
 * @param {Array} pubsets - Array of pubset objects with tbmdjoined data
 * @returns {Object} { allData, filteredData } - allData contains all 5 levels, filteredData is Portfolio/Project only for preview
 */
const mergeAndFilterPubsetData = (pubsets) => {
  let mergedData = [];

  for (const pubset of pubsets) {
    if (pubset.tbmdjoined && Array.isArray(pubset.tbmdjoined)) {
      const prefixedItems = pubset.tbmdjoined.map(item => ({
        ...item,
        tbID: `${pubset.id}-${item.tbID || ''}`,
        tbSelfKey2: item.tbSelfKey2 ? `${pubset.id}-${item.tbSelfKey2}` : item.tbSelfKey2,
      }));

      mergedData = [...mergedData, ...prefixedItems];
    }
  }

  const filteredData = mergedData.filter(item => {
    const tbType = item.tbType || '';
    return tbType === 'Portfolio' || tbType === 'Project';
  });

  return { allData: mergedData, filteredData };
};

const ConsolidatedReportPage = async ({ searchParams }) => {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin?callbackUrl=/dashboard/pubsets")
  }

  const ids = searchParams?.ids || '';
  const { user: { email }, jwt } = session;

  if (!ids) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-red-600">No Pubsets Selected</h1>
        <p>Please select pubsets from the main page to generate a consolidated report.</p>
        <a href="/dashboard/pubsets" className="text-blue-600 hover:underline mt-4 inline-block">
          &larr; Back to Pubsets
        </a>
      </div>
    );
  }

  const pubsets = await fetchPubsetsByIds(ids, jwt);

  if (pubsets.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-red-600">No Valid Pubsets Found</h1>
        <p>The selected pubsets could not be loaded or have no data.</p>
        <a href="/dashboard/pubsets" className="text-blue-600 hover:underline mt-4 inline-block">
          &larr; Back to Pubsets
        </a>
      </div>
    );
  }

  const { allData: fullConsolidatedData, filteredData: consolidatedData } = mergeAndFilterPubsetData(pubsets);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <a href="/dashboard/pubsets" className="text-blue-600 hover:underline">
          &larr; Back to Pubsets
        </a>
        <h1 className="text-3xl font-bold mt-3 mb-2">Dashboard Data Source Review</h1>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-900 font-medium mb-2">
            Review your consolidated data before saving
          </p>
          <p className="text-sm text-green-800">
            This page shows a preview of the combined data from {pubsets.length} pubset{pubsets.length !== 1 ? 's' : ''} you selected.
            The preview below shows {consolidatedData.length} Portfolio and Project items. When saved, the dashboard source
            will include all {fullConsolidatedData.length} items across all hierarchy levels (Portfolio, Project, Sub-Project, Task, Allocation).
            Click <strong>&quot;Save As Dashboard Source&quot;</strong> in the blue section below to save, or go back and select different pubsets.
          </p>
        </div>
      </div>

      {/* Pubsets Metadata Section - Collapsible with Save Button */}
      <IncludedPubsetsSection
        pubsets={pubsets}
        consolidatedData={fullConsolidatedData}
      />

      {/* Filtered Data Section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Portfolio and Project Items ({consolidatedData.length} items)
        </h2>
        <p className="text-sm text-gray-600">
          Filtered to show only items where Type = Portfolio or Project
        </p>
      </div>

      <ConsolidatedReportComponent
        data={consolidatedData}
        pubsets={pubsets}
        token={jwt}
        userEmail={email}
      />
    </div>
  );
};

export default ConsolidatedReportPage;
