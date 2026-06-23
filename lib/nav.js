// Site navigation, derived from the original Northern Wireless menu
// (tblMenuMain + tblMenu in the legacy Access database), reordered to match
// the order the live site used.
export const nav = [
  { title: "Home", href: "/" },
  {
    title: "Turn-key Solutions",
    href: "/turn-key-solutions",
    children: [
      { title: "Communities", href: "/turn-key-solutions/communities" },
      { title: "Internet Service Provider", href: "/turn-key-solutions/isp" },
      { title: "Marinas", href: "/turn-key-solutions/marinas" },
      { title: "Office", href: "/turn-key-solutions/office" },
      { title: "Education", href: "/turn-key-solutions/education" },
      { title: "Health Care", href: "/turn-key-solutions/health-care" },
    ],
  },
  {
    title: "Products",
    href: "/products",
    children: [
      { title: "Access Points", href: "/products/access-points" },
      { title: "Bandwidth Control", href: "/products/bandwidth-control" },
      { title: "Antennas and Cables", href: "/products/antennas-and-cables" },
      { title: "Servers", href: "/products/servers" },
      { title: "Authentication & Security", href: "/products/authentication-security" },
      { title: "Consulting Services", href: "/products/consulting-services" },
      { title: "FAQ", href: "/products/faq" },
    ],
  },
  {
    title: "About",
    href: "/company",
    children: [
      { title: "Contact Info", href: "/company/contact" },
      { title: "History", href: "/company/history" },
      { title: "Mission Statement", href: "/company/mission" },
    ],
  },
  { title: "Markets", href: "/markets" },
  {
    title: "Links",
    href: "/links",
    children: [
      { title: "Vendors We Use", href: "/links/vendors" },
      { title: "Wireless Information", href: "/links/wireless-information" },
      // Always present. AuthGuard on /dashboard renders it when logged in,
      // or redirects to /login when not.
      { title: "Dashboard", href: "/dashboard" },
    ],
  },
];
