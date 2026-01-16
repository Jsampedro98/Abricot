"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-9xl font-bold text-[#D95F18] opacity-20">404</h1>
        <div className="-mt-16 relative z-10 space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Page introuvable</h2>
          <p className="text-muted-foreground">
            Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
          <div className="pt-4">
            <Link href="/dashboard">
              <Button className="bg-[#1A1A1A] hover:bg-[#333] text-white gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour au tableau de bord
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
