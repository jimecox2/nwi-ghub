// app/dashboard/page.jsx
import { auth } from "@/auth/auth"
import { redirect } from "next/navigation"
import ExecutiveDashboard from "./_components/ExecutiveDashboard"

/**
 * Enterprise Landing Page
 * Executive dashboard with stats and insights from dashboard sources
 */
const EnterprisePage = async () => {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin?callbackUrl=/dashboard")
  }

  const { user: { email }, jwt } = session

  return (
    <div className="container mx-auto p-6">
      <ExecutiveDashboard userEmail={email} jwt={jwt} />
    </div>
  )
}

export default EnterprisePage
