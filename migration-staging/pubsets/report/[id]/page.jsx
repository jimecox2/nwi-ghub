// app/dashboard/pubsets/report/[id]/page.jsx
import { auth } from "@/auth/auth"
import { redirect } from "next/navigation"
import { API_URL } from '@/config/index';
import PubsetReportComponent from "@/components/Dashboard/Reports/PubsetReportComponent.jsx"

/**
 * Fetch pubset data by ID
 * @param {string} id - Pubset ID
 * @param {string} jwt - Auth token
 * @returns {Promise<Object>} Pubset data
 */
const fetchPubsetById = async (id, jwt) => {
  try {
    const res = await fetch(
      `${API_URL}/timebars/${id}?fields[0]=name&fields[1]=owner&fields[2]=tbmdjoined`,
      {
        headers: { 'Authorization': `Bearer ${jwt}` },
        cache: 'no-store'
      }
    );

    if (!res.ok) {
      console.error('Failed to fetch pubset:', res.status, res.statusText);
      return null;
    }

    const data = await res.json();

    return {
      id: data.data.id,
      name: data.data.attributes.name || 'Untitled',
      owner: data.data.attributes.owner || 'N/A',
      tbmdjoined: data.data.attributes.tbmdjoined || null
    };
  } catch (error) {
    console.error('Error fetching pubset:', error);
    return null;
  }
};

const PubsetReportPage = async ({ params }) => {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin?callbackUrl=/dashboard/pubsets")
  }

  const { id } = params;
  const { user: { email }, jwt } = session;

  const pubset = await fetchPubsetById(id, jwt);

  if (!pubset || !pubset.tbmdjoined) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Pubset Not Found</h1>
        <p>The pubset you&apos;re looking for doesn&apos;t exist or has no data.</p>
        <a href="/dashboard/pubsets" className="text-blue-600 hover:underline mt-4 inline-block">
          &larr; Back to Pubsets
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <a href="/dashboard/pubsets" className="text-blue-600 hover:underline">
          &larr; Back to Pubsets
        </a>
        <h1 className="text-2xl font-bold mt-2">Pubset Report: {pubset.name}</h1>
        <p className="text-gray-600">Owner: {pubset.owner}</p>
      </div>
      <PubsetReportComponent
        data={pubset.tbmdjoined}
        token={jwt}
        userEmail={email}
      />
    </div>
  );
};

export default PubsetReportPage;
