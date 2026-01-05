"use client";

import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projets', href: '/projects', icon: FolderKanban },
];

export function Sidebar() {
  // We can use usePathname to highlight active link (will need to wrap in Client Component or handle logic correctly)
  // For now, simple structure.
  
  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-border">
      <div className="p-6">
        <Image src="/logo-orange.svg" alt="Abricot" width={140} height={40} priority />
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              "text-foreground/70 hover:bg-primary-light hover:text-primary",
              // Logic for active state would go here, e.g. pathname === item.href && "bg-primary text-white"
            )}
          >
            <item.icon className={cn("mr-3 h-5 w-5 flex-shrink-0 transition-colors group-hover:text-primary")} aria-hidden="true" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
         <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
              AD
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-foreground">Admin User</p>
              <p className="text-xs text-muted-foreground">admin@abricot.co</p>
            </div>
         </div>
      </div>
    </div>
  );
}
