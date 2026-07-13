import Link from "next/link";

export const metadata = {
  title: "Knowledge Base — Northern Wireless Intranet",
  description: "Internal guides, runbooks and customer documentation.",
};

// Customer-facing document sets, grouped by engagement. Files are served from
// /public/docs (paths are URL-encoded because some folders contain spaces).
const customerDocs = [
  {
    engagement: "Fort Frances — Jam21",
    documents: [
      {
        title: "Business Case",
        date: "Jun 19, 2026",
        href: "/docs/business%20case/Business_Case_FortFrances_Wireless.pdf",
      },
      {
        title: "Proposal",
        date: "Jul 3, 2026",
        href: "/docs/proposals/Proposal_FortFrances_Wireless.pdf",
      },
      {
        title: "Supply & Install Contract",
        date: "Jul 17, 2026",
        href: "/docs/contracts/Contract_FortFrances_Wireless.pdf",
      },
    ],
  },
];

function DocIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-[#0b4d8e]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinejoin="round" />
      <path d="M14 2v6h6" strokeLinejoin="round" />
    </svg>
  );
}

export default function KnowledgeBasePage() {
  return (
    <div className="not-prose">
      <nav className="text-sm text-gray-500">
        <Link href="/intranet" className="hover:text-[#0b4d8e]">
          Intranet
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Knowledge Base</span>
      </nav>

      <header className="mt-2">
        <h1 className="text-3xl font-semibold text-[#062f57]">Knowledge Base</h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          Internal guides, runbooks and customer documentation.
        </p>
      </header>

      <section className="mt-8">
        <h2 className="border-b border-gray-200 pb-2 text-xl font-semibold text-[#062f57]">
          Customer Documentation
        </h2>

        {customerDocs.map((group) => (
          <div key={group.engagement} className="mt-6">
            <h3 className="text-base font-semibold text-[#0b4d8e]">{group.engagement}</h3>
            <ul className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-200">
              {group.documents.map((doc) => (
                <li key={doc.href}>
                  <a
                    href={doc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50"
                  >
                    <DocIcon />
                    <span className="flex-1 font-medium text-gray-900">{doc.title}</span>
                    <span className="text-sm text-gray-500">{doc.date}</span>
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      PDF
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
