'use client'

/**
 * HelpChatPanel — AI Help Assistant UI
 *
 * Self-contained client component. Contains:
 *   - HELP_DOCS registry (28 files, paths resolve to public/docsHelp/)
 *   - loadAllDocs() — fetches and caches markdown files by product
 *   - Full chat UI with product tabs, message history, markdown rendering
 *   - Calls the existing Cloudflare Worker for AI responses (no new API route needed)
 *
 * NOTE: Markdown rendering uses Tailwind Typography (prose classes).
 * If AI responses appear unformatted after deployment, install the plugin:
 *   npm install @tailwindcss/typography
 * Then add 'typography' to the plugins array in tailwind.config.js.
 *
 * Props:
 *   defaultProduct  {string}   — 'AB' | 'TB' | 'CB'  initial active product
 *   licenseProducts {string[]} — product codes the user is licensed for
 *   userEmail       {string}   — user's email (for logging/future use)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bot, User, Send, Trash2, Copy, CheckCheck, AlertCircle,
} from 'lucide-react'

// ─── Configuration ────────────────────────────────────────────────────────────

const WORKER_URL = 'https://timebars-help-assistant.jcox-477.workers.dev/'
const MAX_HISTORY_ITEMS = 10
const DOCS_CACHE_TTL = 1000 * 60 * 60 // 1 hour

const PRODUCT_NAMES = {
  AB: 'Agilebars',
  TB: 'Timebars',
  CB: 'Costbars',
}

// Module-level cache — survives re-renders, resets on full page reload
const _docsCache = {
  AB: { data: null, ts: 0 },
  TB: { data: null, ts: 0 },
  CB: { data: null, ts: 0 },
}

// ─── Help Docs Registry ───────────────────────────────────────────────────────
// Paths are root-relative to Next.js public/ folder.
// IMPORTANT: All .md files must be copied to public/docsHelp/ in the target site.
// File counts: AB = 24, TB = 23, CB = 26  (22 common + product-specific)

const HELP_DOCS = {

  // ── COMMON — All Products (22 files) ──────────────────────────────────────

  'getting-started.md': {
    title: 'Getting Started Guide',
    category: 'User Guide',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Common_01_Getting_Started.md',
    priority: 1,
  },
  'innovations.md': {
    title: 'Innovations by Timebars Ltd',
    category: 'Overview',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Common_01_Innovations_By_Timebars_Ltd.md',
    priority: 2,
  },
  'product-design-strategy.md': {
    title: 'Product Design Strategy',
    category: 'Overview',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Common_01_Product_Design_Strategy.md',
    priority: 3,
  },
  'user-interface-guide.md': {
    title: 'User Interface Guide',
    category: 'User Guide',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Common_02_User_Interface_Guide.md',
    priority: 2,
  },
  'configurable-features.md': {
    title: 'Configurable Features User Guide',
    category: 'User Guide',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Common_03_Configurable_Features_User_Guide.md',
    priority: 3,
  },
  'data-management.md': {
    title: 'Data Management User Guide',
    category: 'User Guide',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Common_03_Data_Management_User_Guide.md',
    priority: 3,
  },
  'data-model-scheduling.md': {
    title: 'Data Model and Scheduling Engine Guide',
    category: 'User Guide',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Common_03_Data_Model_and_Scheduling_Engine_Guide.md',
    priority: 3,
  },
  'metadata-fields.md': {
    title: 'MetaData Fields Detail Report',
    category: 'User Guide',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Common_03_MetaData_Fields_Detail_Report.md',
    priority: 3,
  },
  'spreadsheet-sync.md': {
    title: 'Spreadsheet Sync User Guide',
    category: 'User Guide',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Common_03_Spreadsheet_Sync_User_Guide.md',
    priority: 3,
  },
  'focd-forms.md': {
    title: 'FOCD Forms User Guide',
    category: 'User Guide',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Common_04_FOCD_Forms_User_Guide.md',
    priority: 4,
  },
  'local-reports-graphs.md': {
    title: 'Local Reports and Graphs Guide',
    category: 'User Guide',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Common_05_Local_Reports_And_Graphs_Guide.md',
    priority: 5,
  },
  'risks-issues-change-requests.md': {
    title: 'Risks, Issues and Change Requests User Guide',
    category: 'User Guide',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Common_05_Risks_Issues_Change_Requests_User_Guide.md',
    priority: 5,
  },
  'ask-ai.md': {
    title: 'How to Use Ask AI',
    category: 'User Guide',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Common_06_How_To_Use_Ask_AI.md',
    priority: 6,
  },
  'cloud-publishing.md': {
    title: 'Cloud Publishing Guide',
    category: 'User Guide',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Common_07_Cloud_Publishing_Guide.md',
    priority: 7,
  },
  'personal-dashboard-guide.md': {
    title: 'Cloud Reports and Dashboard Guide',
    category: 'User Guide',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Common_08_Personal_Dashboard_Guide.md',
    priority: 8,
  },
  'enterprise-dashboard-guide.md': {
    title: 'Enterprise Dashboard Guide',
    category: 'User Guide',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Common_09_Enterprise_Dashboard_Guide.md',
    priority: 8,
  },
  'text-notifications.md': {
    title: 'Text Notifications',
    category: 'User Guide',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Common_10_Text_Notifications.md',
    priority: 7,
  },
  'text-notifications-technical.md': {
    title: 'Text Notifications Technical Details',
    category: 'Technical',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Common_10_Text_Notifications_Technical_Details.md',
    priority: 9,
  },
  'supply-demand-grids.md': {
    title: 'Supply and Demand Grids User Guide',
    category: 'User Guide',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Common_11_Supply_And_Demand_Grids_User_Guide.md',
    priority: 5,
  },
  'customer-installation-options.md': {
    title: 'Customer Installation Options',
    category: 'Installation',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Common_12_Customer_Installation_Options.md',
    priority: 9,
  },
  'data-migration.md': {
    title: 'Data Migration Assistance',
    category: 'Installation',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Common_12_Data_Migration_Assistance.md',
    priority: 9,
  },
  'writing-business-case.md': {
    title: 'Writing a Business Case',
    category: 'PPM Guide',
    products: ['TB', 'AB', 'CB'],
    path: '/docsHelp/Costbars_Writing_A_Business_Case.md',
    priority: 5,
  },

  // ── COSTBARS — 4 files ────────────────────────────────────────────────────

  'costbars-user-guide.md': {
    title: 'Costbars User Guide',
    category: 'User Guide',
    products: ['CB'],
    path: '/docsHelp/Costbars_User_Guide.md',
    priority: 1,
  },
  'ppm-portfolio-status-balancing.md': {
    title: 'PPM Portfolio Status and Balancing Report',
    category: 'PPM Guide',
    products: ['CB'],
    path: '/docsHelp/Costbars_PPM_Portfolio_Status_And_Balancing_Report.md',
    priority: 3,
  },
  'ppm-project-assessment.md': {
    title: 'PPM Project Assessment Tool',
    category: 'PPM Guide',
    products: ['CB'],
    path: '/docsHelp/Costbars_PPM_Project_Assessment_Tool.md',
    priority: 4,
  },
  'ppm-scoring-guide.md': {
    title: 'PPM Scoring Guide - 5 Step Process',
    category: 'PPM Guide',
    products: ['CB'],
    path: '/docsHelp/Costbars_PPM_Scoring_Guide_5_Step_Process.md',
    priority: 3,
  },

  // ── TIMEBARS — 1 file ─────────────────────────────────────────────────────

  'timebars-user-guide.md': {
    title: 'Timebars User Guide',
    category: 'User Guide',
    products: ['TB'],
    path: '/docsHelp/Timebars_User_Guide.md',
    priority: 1,
  },

  // ── AGILEBARS — 2 files ───────────────────────────────────────────────────

  'agilebars-user-guide.md': {
    title: 'Agilebars User Guide',
    category: 'User Guide',
    products: ['AB'],
    path: '/docsHelp/Agilebars_User_Guide.md',
    priority: 1,
  },
  'kanban-primer.md': {
    title: 'Kanban Primer',
    category: 'Methodology',
    products: ['AB'],
    path: '/docsHelp/Agilebars_Kanban_Primer.md',
    priority: 3,
  },
}

// ─── Utility Functions ────────────────────────────────────────────────────────

function getDocCount(productCode) {
  return Object.values(HELP_DOCS).filter(d => d.products.includes(productCode)).length
}

async function loadAllDocs(productCode) {
  const now = Date.now()
  const cache = _docsCache[productCode]

  if (cache.data && (now - cache.ts) < DOCS_CACHE_TTL) {
    return cache.data
  }

  const entries = Object.entries(HELP_DOCS)
    .filter(([, config]) => config.products.includes(productCode))
    .sort((a, b) => a[1].priority - b[1].priority)

  const results = await Promise.allSettled(
    entries.map(async ([filename, config]) => {
      const res = await fetch(config.path)
      if (!res.ok) throw new Error(`${filename}: ${res.status} ${res.statusText}`)
      const content = await res.text()
      return { title: config.title, category: config.category, content }
    })
  )

  const loaded = []
  const failed = []
  for (const result of results) {
    if (result.status === 'fulfilled') loaded.push(result.value)
    else failed.push(result.reason?.message)
  }

  if (failed.length > 0) {
    console.warn(`⚠️ Failed to load ${failed.length} help doc(s):`, failed)
  }

  const consolidated = loaded.map(doc =>
    `═══════════════════════════════════════════════════════════════\n` +
    `📄 ${doc.title}\nCategory: ${doc.category}\n` +
    `═══════════════════════════════════════════════════════════════\n\n` +
    `${doc.content}\n\n`
  ).join('\n\n')

  _docsCache[productCode] = { data: consolidated, ts: now }
  console.log(`✓ Loaded ${loaded.length} help docs for ${productCode}`)
  return consolidated
}

function renderMarkdown(text) {
  const raw = marked.parse(text)
  return DOMPurify.sanitize(typeof raw === 'string' ? raw : String(raw))
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function WelcomeContent({ productName, docCount }) {
  return (
    <div className="p-6 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900">
      <div className="flex items-center gap-3 mb-3">
        <Bot className="w-8 h-8 text-tbBlue flex-shrink-0" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-poppins">
          {productName} Help Assistant
        </h3>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
        Ask me anything about how to use {productName}. I answer only from the official documentation.
      </p>
      <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc ml-5 space-y-1 mb-4">
        <li>Creating and managing projects, tasks, and milestones</li>
        <li>Reports, graphs, and dashboards</li>
        <li>Resource allocation and scheduling</li>
        <li>Field definitions and data management</li>
        <li>Features specific to {productName}</li>
      </ul>
      <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
        <Badge variant="secondary" className="text-xs">
          📚 {docCount} documentation files loaded
        </Badge>
        <span className="hidden sm:inline">•</span>
        <span className="text-gray-400 dark:text-gray-500">
          Powered by Google Gemini
        </span>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800/60 rounded p-3 border border-gray-200 dark:border-gray-700">
        <strong>💡 Tips:</strong> Ask specific questions for best results.
        Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd> to send,{' '}
        <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Shift+Enter</kbd> for a new line.
      </div>
    </div>
  )
}

function LoadingBubble() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-tbBlue flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

function UserBubble({ content }) {
  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="bg-tbBlue text-white rounded-lg px-4 py-3 max-w-[80%]">
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
        <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </div>
    </div>
  )
}

function AssistantBubble({ id, content, copiedId, onCopy }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-tbBlue flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 max-w-[80%]">
        <div
          className="text-sm text-gray-800 dark:text-gray-200 prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
        <button
          onClick={() => onCopy(id, content)}
          className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Copy response to clipboard"
        >
          {copiedId === id ? (
            <>
              <CheckCheck className="w-3 h-3 text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function ErrorBubble({ content }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
      </div>
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 max-w-[80%]">
        <p className="text-sm text-red-700 dark:text-red-400">{content}</p>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HelpChatPanel({
  defaultProduct = 'TB',
  licenseProducts = ['TB'],
  userEmail,
}) {
  const [activeProduct, setActiveProduct] = useState(defaultProduct)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  const textareaRef = useRef(null)
  const messagesEndRef = useRef(null)

  const productName = PRODUCT_NAMES[activeProduct] || 'Timebars'
  const docCount    = getDocCount(activeProduct)

  // ── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    setMessages([])
    loadConversationHistory(activeProduct)
    loadAllDocs(activeProduct).catch(console.error) // warm the cache in background
  }, [activeProduct])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Persistence ───────────────────────────────────────────────────────────

  function loadConversationHistory(product) {
    try {
      const saved = localStorage.getItem(`helpAiHistory_${product}`)
      if (!saved) return
      const history = JSON.parse(saved)
      const recent = history.slice(-5)
      const restored = recent.flatMap(item => [
        { id: `h-u-${item.ts}`, role: 'user',      content: item.question },
        { id: `h-a-${item.ts}`, role: 'assistant', content: item.answer   },
      ])
      if (restored.length > 0) setMessages(restored)
    } catch {
      // localStorage unavailable or corrupted — ignore
    }
  }

  function saveToHistory(question, answer) {
    try {
      const key     = `helpAiHistory_${activeProduct}`
      const saved   = localStorage.getItem(key)
      const history = saved ? JSON.parse(saved) : []
      history.push({ question, answer, ts: Date.now() })
      if (history.length > MAX_HISTORY_ITEMS) {
        history.splice(0, history.length - MAX_HISTORY_ITEMS)
      }
      localStorage.setItem(key, JSON.stringify(history))
    } catch {
      // ignore
    }
  }

  // ── Core Actions ──────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const question = inputValue.trim()
    if (!question || isLoading) return

    setInputValue('')

    const loadingId = `l-${makeId()}`
    setMessages(prev => [
      ...prev,
      { id: `u-${makeId()}`, role: 'user',    content: question },
      { id: loadingId,        role: 'loading', content: ''       },
    ])
    setIsLoading(true)

    try {
      const docsContext = await loadAllDocs(activeProduct)

      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuestion: question,
          productCode:  activeProduct,
          docsContext,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || err.message || `HTTP ${res.status}`)
      }

      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Unknown error from AI service')

      const answerId = `a-${makeId()}`
      setMessages(prev =>
        prev
          .filter(m => m.id !== loadingId)
          .concat({ id: answerId, role: 'assistant', content: data.answer })
      )
      saveToHistory(question, data.answer)

    } catch (error) {
      let errorText = '❌ Something went wrong. '
      if (error.message?.includes('429')) {
        errorText += 'Rate limit reached — please wait a minute and try again.'
      } else if (error.message?.includes('GEMINI_API_KEY')) {
        errorText += 'The AI service is not configured. Please contact support.'
      } else {
        errorText += error.message || 'Please try again later.'
      }
      setMessages(prev =>
        prev
          .filter(m => m.id !== loadingId)
          .concat({ id: `e-${makeId()}`, role: 'error', content: errorText })
      )
    } finally {
      setIsLoading(false)
      textareaRef.current?.focus()
    }
  }, [inputValue, isLoading, activeProduct])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleClear() {
    setMessages([])
    try {
      localStorage.removeItem(`helpAiHistory_${activeProduct}`)
    } catch {
      // ignore
    }
  }

  async function handleCopy(messageId, content) {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(messageId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // Clipboard API unavailable — ignore
    }
  }

  function handleProductChange(product) {
    if (!licenseProducts.includes(product)) return
    setActiveProduct(product)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Card className="w-full shadow-md border border-gray-200 dark:border-gray-700">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <CardHeader className="pb-0 border-b border-gray-100 dark:border-gray-800">

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-tbBlue flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white font-poppins leading-tight">
                Help Assistant
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Powered by Google Gemini · Official documentation only
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-tbBlue border-tbBlue font-medium hidden sm:flex">
            {productName}
          </Badge>
        </div>

        {/* Product Tabs */}
        <Tabs value={activeProduct} onValueChange={handleProductChange} className="mb-0">
          <TabsList className="grid grid-cols-3 w-full max-w-sm">
            {['TB', 'AB', 'CB'].map(code => {
              const licensed = licenseProducts.includes(code)
              return (
                <TabsTrigger
                  key={code}
                  value={code}
                  disabled={!licensed}
                  className={!licensed ? 'opacity-40 cursor-not-allowed' : ''}
                  title={
                    !licensed
                      ? `Your license does not include ${PRODUCT_NAMES[code]}`
                      : `Switch to ${PRODUCT_NAMES[code]}`
                  }
                >
                  {PRODUCT_NAMES[code]}
                  {!licensed && (
                    <span className="ml-1 text-xs" aria-label="Not licensed">🔒</span>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>

      </CardHeader>

      {/* ── Message Area ─────────────────────────────────────────────────── */}
      <CardContent className="p-0">
        <ScrollArea className="h-[520px]">
          <div className="px-6 py-5 space-y-4">

            {messages.length === 0 ? (
              <WelcomeContent productName={productName} docCount={docCount} />
            ) : (
              messages.map(msg => {
                if (msg.role === 'loading')   return <LoadingBubble   key={msg.id} />
                if (msg.role === 'user')      return <UserBubble      key={msg.id} content={msg.content} />
                if (msg.role === 'error')     return <ErrorBubble     key={msg.id} content={msg.content} />
                return (
                  <AssistantBubble
                    key={msg.id}
                    id={msg.id}
                    content={msg.content}
                    copiedId={copiedId}
                    onCopy={handleCopy}
                  />
                )
              })
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />

          </div>
        </ScrollArea>

        {/* ── Input Area ───────────────────────────────────────────────────── */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 space-y-3">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask a question about ${productName}...\nExample: How do I create a new project?`}
            rows={3}
            disabled={isLoading}
            className="resize-none focus-visible:ring-tbBlue"
            aria-label="Help question input"
          />

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-2">
              <Button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="bg-tbBlue hover:bg-blue-800 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Thinking...' : 'Ask'}
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={isLoading || messages.length === 0}
                aria-label="Clear conversation"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 text-right">
              📚 {docCount} docs loaded · Enter to send
            </span>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
