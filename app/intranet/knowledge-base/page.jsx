import Link from "next/link";

export const metadata = {
  title: "Knowledge Base — Northern Wireless Intranet",
  description: "Internal guides, runbooks and customer documentation.",
};

// Mirrors the folder structure under /public/docs. Each customer section maps
// to a public/docs/customers/<folder> directory; only .pdf files are linked
// (the sibling .md files are source content, not downloads). Engineering and
// Vendors have no /public/docs folders yet, so they render as placeholders.
const customers = [
  {
    name: "Fort Frances",
    basePath: "/docs/customers/FortFrances",
    documents: [
      { title: "Business Case", file: "Business_Case_FortFrances_Wireless.pdf" },
      { title: "Proposal", file: "Proposal_FortFrances_Wireless.pdf" },
      { title: "Contract", file: "Contract_FortFrances_Wireless.pdf" },
    ],
  },
];

const COLUMNS = 4;

function chunk(items, size) {
  const rows = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

function DownloadsTable({ basePath, documents }) {
  const rows = chunk(documents, COLUMNS);

  return (
    <table className="mt-3 w-full table-fixed border-collapse overflow-hidden rounded-lg border border-gray-200 text-sm">
      <tbody className="divide-y divide-gray-100 bg-white">
        {rows.length ? (
          rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {row.map((doc) => (
                <td key={doc.file} className="w-1/4 px-4 py-3">
                  <a
                    href={`${basePath}/${doc.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0b4d8e] hover:underline"
                  >
                    {doc.title}
                  </a>
                </td>
              ))}
              {Array.from({ length: COLUMNS - row.length }).map((_, j) => (
                <td key={`empty-${j}`} className="w-1/4 px-4 py-3" />
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={COLUMNS} className="px-4 py-3 text-gray-500">
              Links coming later&hellip;
            </td>
          </tr>
        )}
      </tbody>
    </table>
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
          Customers
        </h2>

        {customers.map((customer) => (
          <div key={customer.name} className="mt-6">
            <h3 className="text-base font-semibold text-[#0b4d8e]">{customer.name}</h3>
            <h4 className="mt-3 text-sm font-semibold text-gray-700">Downloads Available</h4>
            <DownloadsTable basePath={customer.basePath} documents={customer.documents} />
          </div>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="border-b border-gray-200 pb-2 text-xl font-semibold text-[#062f57]">
          Engineering
        </h2>
        <h4 className="mt-4 text-sm font-semibold text-gray-700">Downloads Available</h4>
        <DownloadsTable basePath="" documents={[]} />
      </section>

      <section className="mt-8">
        <h2 className="border-b border-gray-200 pb-2 text-xl font-semibold text-[#062f57]">
          Vendors
        </h2>
        <h4 className="mt-4 text-sm font-semibold text-gray-700">Downloads Available</h4>
        <DownloadsTable basePath="" documents={[]} />
      </section>
    </div>
  );
}
