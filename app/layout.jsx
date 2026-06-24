import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import SiteChrome from "@/components/SiteChrome";

export const metadata = {
  title: "Northern Wireless Inc.",
  description: "Wireless internet solutions for the rest of us.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <AuthProvider>
          <SiteChrome>{children}</SiteChrome>
        </AuthProvider>
      </body>
    </html>
  );
}
