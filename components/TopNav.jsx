"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { nav } from "@/lib/nav";

export default function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null); // for mobile accordions

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/nwi-logo.jpg"
            alt="Northern Wireless Inc."
            width={180}
            height={85}
            priority
          />
        </Link>

        {/* Desktop menu */}
        <ul className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <li key={item.href} className="group relative">
              <Link
                href={item.href}
                className="block rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                {item.title}
              </Link>
              {item.children && (
                <ul className="invisible absolute left-0 top-full z-50 min-w-56 rounded-md border border-gray-200 bg-white py-1 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {child.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <ul className="space-y-1 border-t border-gray-200 px-4 py-3 md:hidden">
          {nav.map((item) => (
            <li key={item.href}>
              <div className="flex items-center justify-between">
                <Link
                  href={item.href}
                  className="block flex-1 rounded px-2 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.title}
                </Link>
                {item.children && (
                  <button
                    type="button"
                    className="px-2 py-2 text-gray-500"
                    aria-label={`Toggle ${item.title}`}
                    onClick={() =>
                      setOpenGroup((g) => (g === item.href ? null : item.href))
                    }
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={openGroup === item.href ? "rotate-180" : ""}
                    >
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
              {item.children && openGroup === item.href && (
                <ul className="ml-3 border-l border-gray-200 pl-3">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className="block rounded px-2 py-2 text-sm text-gray-600 hover:bg-gray-100"
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
