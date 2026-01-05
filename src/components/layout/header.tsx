"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Folder } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'AB';
  };

  const navItems = [
    { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projets", href: "/projects", icon: Folder },
  ];

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-border bg-white px-8">
      {/* Logo */}
      <div className="flex-shrink-0">
        <Image src="/logo-orange.svg" alt="Abricot" width={110} height={32} priority />
      </div>

      {/* Navigation */}
      <nav className="flex items-center space-x-12">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#111111] text-white"
                  : "text-[#D95F18] hover:bg-orange-50"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-[#D95F18]")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="flex-shrink-0">
         <div className="h-10 w-10 rounded-full bg-[#FFE4D6] flex items-center justify-center text-[#5E3A2A] text-sm font-semibold border border-[#FFD0B8]">
            {getInitials()}
         </div>
      </div>
    </header>
  );
}
