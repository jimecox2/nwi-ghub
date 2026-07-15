import Link from "next/link";
import ProjectsTable from "@/components/intranet/ProjectsTable";

export const metadata = {
  title: "Projects — Northern Wireless Intranet",
  description: "Projects currently being worked on across the team.",
};

export default function ProjectsPage() {
  return (
    <div className="not-prose">
      <nav className="text-sm text-gray-500">
        <Link href="/intranet" className="hover:text-[#0b4d8e]">
          Intranet
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Projects</span>
      </nav>

      <header className="mt-2">
        <h1 className="text-3xl font-semibold text-[#062f57]">Projects Proposed</h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          Projects in approval stage the team is currently working on, pulled
          live from your customer&rsquo;s active Costbars pubset.
        </p>
      </header>

      <div className="mt-6">
        <ProjectsTable />
      </div>
    </div>
  );
}
