// app/dashboard/sources/page.jsx
import { auth } from "@/auth/auth"
import { redirect } from "next/navigation"
import DashboardSourceSelector from "./_components/DashboardSourceSelector"
import EnterpriseDashboardContent from "./_components/EnterpriseDashboardContent"
import { getUserByEmail } from "@/lib/crud/coreCrud"

/**
 * Enterprise Dashboard Sources Page
 * Displays data from saved dashboard sources with multi-pubset consolidation
 */
const EnterpriseDashboardPage = async ({ searchParams }) => {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin?callbackUrl=/dashboard/sources")
  }

  const { user: { email }, jwt } = session;
  const selectedSourceId = searchParams?.source || null;

  // Fetch user from Strapi to get correct Customer_id
  let customerId = null;
  try {
    const strapiUser = await getUserByEmail(email, jwt)
    customerId = strapiUser?.Customer_id || null
  } catch (error) {
    console.error('Error fetching user Customer_id:', error)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Dashboard Source Selector */}
      <DashboardSourceSelector
        selectedSourceId={selectedSourceId}
        userEmail={email}
        customerId={customerId}
        jwt={jwt}
      />

      {/* Dashboard Content */}
      <EnterpriseDashboardContent
        selectedSourceId={selectedSourceId}
        userEmail={email}
        jwt={jwt}
      />
    </div>
  );
};

export default EnterpriseDashboardPage;
