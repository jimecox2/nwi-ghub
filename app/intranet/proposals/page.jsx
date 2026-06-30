import Link from "next/link";
import ProposalsTable from "@/components/intranet/ProposalsTable";

export const metadata = {
  title: "Proposals — Northern Wireless Intranet",
  description: "Proposals currently being worked on across the team.",
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
          Active proposals the team is currently working on — new items in the
          Proposed, Triaged, Prioritized, Selected and Assigned stages, pulled
          live from the active dashboard source.
        </p>
      </header>

      <div className="mt-6">
        <ProposalsTable />
      </div>
    </div>
  );
}
