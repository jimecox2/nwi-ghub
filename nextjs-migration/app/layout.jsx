import TopNav from "@/components/TopNav";

export const metadata = {
  title: "Northern Wireless Inc.",
  description: "Wireless internet solutions for the rest of us.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <TopNav />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <article className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-blue-700">
            {children}
          </article>
        </main>
        <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Northern Wireless Inc.
        </footer>
      </body>
    </html>
  );
}
