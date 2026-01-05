"use client";

import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-border/40 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6 md:px-8 flex items-center justify-between">
        <div className="flex-shrink-0">
          <Image src="/logo-black.svg" alt="Abricot" width={90} height={20} className="opacity-90" />
        </div>
        <p className="text-sm text-muted-foreground/80 font-medium">Abricot 2025</p>
      </div>
    </footer>
  );
}
