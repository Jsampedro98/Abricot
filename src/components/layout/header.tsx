import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export function Header({ title }: { title?: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6">
      <h1 className="text-xl font-semibold text-foreground">{title || 'Tableau de bord'}</h1>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5 text-gray-500" />
        </Button>
      </div>
    </header>
  );
}
