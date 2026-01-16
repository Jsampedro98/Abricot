"use client";

import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, Folder } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TaskCardProps {
  task: Task;
  view: "list" | "kanban";
  onView?: () => void;
}

export function TaskCard({ task, view, onView }: TaskCardProps) {
  const statusColors: Record<string, string> = {
    TODO: "bg-pink-100 text-pink-700 hover:bg-pink-200",
    IN_PROGRESS: "bg-orange-100 text-orange-700 hover:bg-orange-200",
    DONE: "bg-green-100 text-green-700 hover:bg-green-200",
    CANCELLED: "bg-gray-100 text-gray-700 hover:bg-gray-200"
  };
  const statusLabels: Record<string, string> = {
    TODO: "À faire",
    IN_PROGRESS: "En cours",
    DONE: "Terminée",
  };

  if (view === "list") {
    return (
      <div className="bg-white rounded-xl border border-border/60 p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-2">
            <div>
                 <h3 className="font-semibold text-base text-foreground mb-1">{task.title}</h3>
                 <p className="text-sm text-muted-foreground line-clamp-1 max-w-xl">{task.description || "Aucune description"}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[task.status] || "bg-gray-100 text-gray-800"}`}>
                {statusLabels[task.status] || task.status}
             </span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
             <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-muted-foreground">
                 <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-gray-400" />
                    <span>{task.project?.name || "Projet inconnu"}</span>
                 </div>
                 {task.dueDate && (
                     <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{format(new Date(task.dueDate), "d MMMM", { locale: fr })}</span>
                     </div>
                 )}
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <span>{task.comments?.length || task._count?.comments || 0}</span>
                 </div>
             </div>

            <Button onClick={onView} variant="secondary" className="w-full sm:w-auto bg-[#1A1A1A] text-white hover:bg-[#333] h-9 px-6 text-sm font-medium rounded-md cursor-pointer">
                Voir
            </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-white rounded-xl border border-border/60 p-4 shadow-sm hover:shadow-md transition-all space-y-4">
        <div className="flex items-start justify-between gap-2">
             <h3 className="font-semibold text-sm text-foreground line-clamp-2">{task.title}</h3>
             <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${statusColors[task.status] || "bg-gray-100 text-gray-800"}`}>
                {statusLabels[task.status] || task.status}
             </span>
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]">{task.description || "Aucune description"}</p>
        
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground pb-1">
             <div className="flex items-center gap-1.5 min-w-0">
                <Folder className="h-3 w-3 shrink-0" />
                <span className="truncate max-w-[80px]">{task.project?.name}</span>
             </div>
             <span className="text-border/80">|</span>
             {task.dueDate && (
                 <>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(task.dueDate), "d MMM", { locale: fr })}</span>
                    </div>
                    <span className="text-border/80">|</span>
                 </>
             )}
             <div className="flex items-center gap-1.5 shrink-0">
                <MessageSquare className="h-3 w-3" />
                <span>{task.comments?.length || task._count?.comments || 0}</span>
             </div>
        </div>

        <Button onClick={onView} className="w-full bg-[#1A1A1A] text-white hover:bg-[#333] h-9 text-xs font-medium rounded-md cursor-pointer">
            Voir
        </Button>
    </div>
  );
}
