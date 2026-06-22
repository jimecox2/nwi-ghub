"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { nav } from "@/lib/nav";

// Palette sampled from boatdealers.ca
const NAVY_BAR =
  "bg-gradient-to-r from-[#062f57] via-[#0b4d8e] to-[#062f57]";
const DROPDOWN_BLUE = "bg-[#2b8fd9]";

function Caret({ className = "" }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null); // for mobile accordions

  return (
    <header className={`sticky top-0 z-50 ${NAVY_BAR} shadow-md`}>
      <div className="mx-auto flex h-[72px] max-w-7xl items-stretch justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center py-2">
          <span className="rounded-md bg-white px-3 py-1.5 shadow-sm">
            <Image
              src="/images/nwi-logo.jpg"
              alt="Northern Wireless Inc."
              width={150}
              height={75}
              className="h-11 w-auto"
              priority
            />
          </span>
        </Link>

        {/* Desktop menu */}
        <ul className="hidden items-stretch lg:flex">
          {nav.map((item) => (
            <li key={item.href} className="group relative flex items-stretch">
              <Link
                href={item.href}
                className="flex items-center gap-1.5 px-4 text-[17px] font-medium text-white transition-colors group-hover:bg-[#2b8fd9]"
              >
                {item.title}
                {item.children && <Caret className="opacity-90" />}
              </Link>

              {item.children && (
                <ul
                  className={`invisible absolute left-0 top-full z-50 min-w-[16rem] ${DROPDOWN_BLUE} opacity-0 shadow-xl transition duration-150 group-hover:visible group-hover:opacity-100`}
                >
                  {item.children.map((child) => (
                    <li
                      key={child.href}
                      className="border-b border-white/15 last:border-b-0"
                    >
                      <Link
                        href={child.href}
                        className="block px-5 py-3.5 text-[16px] text-white transition-colors hover:bg-[#1d7ec4]"
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
          className="inline-flex items-center justify-center p-2 text-white lg:hidden"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <ul className={`${DROPDOWN_BLUE} lg:hidden`}>
          {nav.map((item) => (
            <li key={item.href} className="border-b border-white/15">
              <div className="flex items-center justify-between">
                <Link
                  href={item.href}
                  className="block flex-1 px-5 py-4 text-[17px] font-medium text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.title}
                </Link>
                {item.children && (
                  <button
                    type="button"
                    className="flex h-full items-center px-5 py-4 text-white"
                    aria-label={`Toggle ${item.title}`}
                    onClick={() =>
                      setOpenGroup((g) => (g === item.href ? null : item.href))
                    }
                  >
                    <Caret
                      className={`transition-transform ${
                        openGroup === item.href ? "rotate-180" : "-rotate-90"
                      }`}
                    />
                  </button>
                )}
              </div>

              {item.children && openGroup === item.href && (
                <ul className="bg-[#1d7ec4]">
                  {item.children.map((child) => (
                    <li
                      key={child.href}
                      className="border-t border-white/15"
                    >
                      <Link
                        href={child.href}
                        className="block px-8 py-3.5 text-[16px] text-white"
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
