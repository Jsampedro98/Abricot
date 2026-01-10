"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Folder, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <header className="flex h-[72px] items-center justify-between border-b border-border bg-white px-4 md:px-8">
      {/* Logo */}
      <div className="flex-shrink-0">
        <Image src="/logo-orange.svg" alt="Abricot" width={110} height={32} priority />
      </div>

      {/* Navigation */}
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-12">
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

      {/* Mobile Menu Toggle */}
      <button 
        className="md:hidden p-2 text-primary"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Menu"
      >
        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-[72px] left-0 right-0 bg-white border-b border-border p-4 shadow-lg md:hidden z-50 animate-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors",
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
        </div>
      )}

      {/* User Profile */}
      <div className="flex-shrink-0">
         <Link href="/account">
            <div className="h-10 w-10 rounded-full bg-[#FFE4D6] flex items-center justify-center text-[#5E3A2A] text-sm font-semibold border border-[#FFD0B8] cursor-pointer hover:bg-[#FFD0B8] transition-colors">
                {getInitials()}
            </div>
         </Link>
      </div>
    </header>
  );
}
