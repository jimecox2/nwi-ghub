import { auth } from '@/auth/auth'
import { redirect } from 'next/navigation'
import { getMyOrders } from '@/lib/crud/coreCrud'
import HelpChatPanel from './_components/HelpChatPanel'

export const metadata = {
  title: 'AI Help Assistant | Timebars',
  description: 'Get instant answers about using your Timebars, Agilebars, or Costbars product — powered by official documentation.',
}

const PRODUCT_CODE_MAP = {
  agilebars: 'AB',
  timebars: 'TB',
  costbars: 'CB',
}

const deriveProductCode = (productName = '') => {
  const lower = productName.toLowerCase()
  for (const [key, code] of Object.entries(PRODUCT_CODE_MAP)) {
    if (lower.includes(key)) return code
  }
  return null
}

const HelpPage = async () => {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin?callbackUrl=/dashboard/help')
  }

  const { user: { email }, jwt } = session

  let licenseProducts = []
  try {
    const orders = await getMyOrders(email, jwt)
    const seen = new Set()
    for (const order of orders) {
      if (!order.active_status) continue
      const code = deriveProductCode(order.product?.name)
      if (code && !seen.has(code)) {
        seen.add(code)
        licenseProducts.push(code)
      }
    }
  } catch {
    // If the fetch fails, fall back to empty — redirect below handles it
  }

  if (licenseProducts.length === 0) {
    redirect('/sales/pricing')
  }

  const defaultProduct = licenseProducts[0]

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">

      <nav aria-label="Breadcrumb" className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        <a href="/dashboard" className="hover:text-tbBlue transition-colors">
          Dashboard
        </a>
        <span className="mx-2" aria-hidden="true">/</span>
        <span className="text-gray-900 dark:text-white">AI Help Assistant</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
          AI Help Assistant
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Ask questions about your product — answered instantly from the official documentation.
        </p>
      </div>

      <HelpChatPanel
        defaultProduct={defaultProduct}
        licenseProducts={licenseProducts}
        userEmail={email}
      />

    </div>
  )
}

export default HelpPage
