import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | Shop-O-Holics",
  description: "Manage your Shop-O-Holics customer profile, orders, and addresses.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
