import Link from "next/link";

export const metadata = {
  title: "Intranet — Northern Wireless",
  description: "Internal home for the Northern Wireless Inc. team.",
};

// Mock intranet landing page. Static placeholder content for now; the cards and
// feeds below are stand-ins until they are wired to real internal data sources.
const quickLinks = [
  { title: "Projects", desc: "Projects currently being worked on", href: "/intranet/projects" },
  { title: "Dashboard", desc: "Enterprise PPM dashboard", href: "/dashboard" },
  { title: "IT Help Desk", desc: "Submit and track support tickets", href: "/intranet" },
  { title: "HR & Benefits", desc: "Policies, time off and payroll", href: "/intranet" },
  { title: "Knowledge Base", desc: "Guides, runbooks and customer documentation", href: "/intranet/knowledge-base" },
  { title: "Field Schedule", desc: "Upcoming site installs and visits", href: "/intranet" },
];

const announcements = [
  {
    date: "Jun 29, 2026",
    title: "Q3 planning kickoff",
    body: "All-hands planning session Thursday at 10:00. Bring your project updates.",
  },
  {
    date: "Jun 24, 2026",
    title: "New antenna stock arrived",
    body: "The latest shipment of access points and antennas is logged in inventory.",
  },
  {
    date: "Jun 18, 2026",
    title: "VPN maintenance window",
    body: "Remote access will be briefly unavailable Saturday 1:00–2:00 AM.",
  },
];

export default function IntranetHome() {
  return (
    <div className="not-prose">
      <section className="rounded-xl bg-[#062f57] px-6 py-8 text-white">
        <p className="text-sm font-medium uppercase tracking-wide text-[#2b8fd9]">
          Northern Wireless Inc.
        </p>
        <h1 className="mt-1 text-3xl font-semibold">Company Intranet</h1>
        <p className="mt-2 max-w-2xl text-[#cfe3f5]">
          Welcome back. Everything the team needs in one place — projects,
          schedules, internal resources and the latest announcements.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-[#062f57]">Quick links</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="block rounded-lg border border-gray-200 p-4 transition hover:border-[#2b8fd9] hover:shadow-sm"
            >
              <h3 className="font-semibold text-[#0b4d8e]">{link.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-[#062f57]">Announcements</h2>
        <ul className="mt-4 space-y-4">
          {announcements.map((item) => (
            <li
              key={item.title}
              className="rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <span className="shrink-0 text-xs text-gray-500">{item.date}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
