"use client";

import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

interface Props {
  isAdmin: boolean;
  firstName: string;
}

export default function Sidebar({ isAdmin, firstName }: Props) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", icon: "🏠", label: "Dashboard" },
    { href: "/analytics", icon: "📊", label: "Analytics" },
    ...(isAdmin ? [{ href: "/admin", icon: "🛡️", label: "Admin" }] : []),
  ];

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">💰 ExpenseIQ</h1>
        <p className="text-gray-400 text-xs mt-1">Smart Finance Tracker</p>
      </div>

      {/* User Section - at top */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
          <div className="ml-1">
            <UserButton />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{firstName}</p>
            <p className="text-xs text-gray-400">My Account</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <a key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${pathname === link.href ? "bg-white text-gray-900" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
            <span className="text-base">{link.icon}</span>
            <span>{link.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}