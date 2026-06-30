import Link from "next/link";

export const metadata = {
  title: "Proposals — Northern Wireless Intranet",
  description: "Proposals currently being worked on across the team.",
};

// Mock proposals data. This array is a placeholder for the table below; it will
// be replaced by data fetched from Strapi in a follow-up. Keep the row shape
// (title, client, owner, stage, value, updated) stable so the swap is a drop-in.
const proposals = [
  {
    title: "Lakeshore Marina Wi-Fi",
    client: "Lakeshore Marina",
    owner: "J. Cox",
    stage: "Drafting",
    value: "$42,000",
    updated: "Jun 28, 2026",
  },
  {
    title: "Northwood Community Last-Mile",
    client: "Township of Northwood",
    owner: "S. Patel",
    stage: "Under Review",
    value: "$118,500",
    updated: "Jun 26, 2026",
  },
  {
    title: "Riverside School District ISP",
    client: "Riverside SD",
    owner: "M. Tremblay",
    stage: "Awaiting Client",
    value: "$76,200",
    updated: "Jun 22, 2026",
  },
  {
    title: "Harbour Hotel Hotspot Upgrade",
    client: "Harbour Hotel Group",
    owner: "J. Cox",
    stage: "Drafting",
    value: "$31,750",
    updated: "Jun 19, 2026",
  },
  {
    title: "Cedar Clinic Health Network",
    client: "Cedar Health Care",
    owner: "S. Patel",
    stage: "Submitted",
    value: "$58,900",
    updated: "Jun 15, 2026",
  },
];

const stageStyles = {
  Drafting: "bg-gray-100 text-gray-700",
  "Under Review": "bg-amber-100 text-amber-800",
  "Awaiting Client": "bg-blue-100 text-blue-800",
  Submitted: "bg-green-100 text-green-800",
};

export default function ProposalsPage() {
  return (
    <div className="not-prose">
      <nav className="text-sm text-gray-500">
        <Link href="/intranet" className="hover:text-[#0b4d8e]">
          Intranet
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Proposals</span>
      </nav>

      <header className="mt-2">
        <h1 className="text-3xl font-semibold text-[#062f57]">Proposals in Progress</h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          Active proposals the team is currently working on. This is mock data
          for now — it will be backed by live records from Strapi.
        </p>
      </header>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-[#062f57] text-left text-white">
            <tr>
              <th className="px-4 py-3 font-semibold">Proposal</th>
              <th className="px-4 py-3 font-semibold">Client</th>
              <th className="px-4 py-3 font-semibold">Owner</th>
              <th className="px-4 py-3 font-semibold">Stage</th>
              <th className="px-4 py-3 text-right font-semibold">Est. Value</th>
              <th className="px-4 py-3 font-semibold">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {proposals.map((p) => (
              <tr key={p.title} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{p.title}</td>
                <td className="px-4 py-3 text-gray-700">{p.client}</td>
                <td className="px-4 py-3 text-gray-700">{p.owner}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      stageStyles[p.stage] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {p.stage}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-700">{p.value}</td>
                <td className="px-4 py-3 text-gray-500">{p.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
