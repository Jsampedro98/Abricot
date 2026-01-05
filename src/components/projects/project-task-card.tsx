"use client";

import { Task, TaskStatus } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MoreHorizontal, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectTaskCardProps {
  task: Task;
}

export function ProjectTaskCard({ task }: ProjectTaskCardProps) {
  const statusColors: Record<TaskStatus, string> = {
    TODO: "bg-pink-100 text-pink-700",
    IN_PROGRESS: "bg-orange-100 text-orange-700",
    DONE: "bg-green-100 text-green-700",
    CANCELLED: "bg-gray-100 text-gray-700"
  };
  const statusLabels: Record<TaskStatus, string> = {
    TODO: "À faire",
    IN_PROGRESS: "En cours",
    DONE: "Terminée",
    CANCELLED: "Annulée"
  };

  return (
    <div className="bg-white rounded-xl border border-border/60 p-6 shadow-sm hover:shadow-md transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
                <h3 className="font-semibold text-base text-foreground">{task.title}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status] || "bg-gray-100 text-gray-800"}`}>
                    {statusLabels[task.status] || task.status}
                </span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{task.description || "Implémenter le système..."}</p>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground min-w-[80px]">Échéance :</span>
                <div className="flex items-center gap-2 text-foreground font-medium">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{task.dueDate ? format(new Date(task.dueDate), "d MMMM", { locale: fr }) : "Non définie"}</span>
                </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
                 <span className="text-muted-foreground min-w-[80px]">Assigné à :</span>
                 <div className="flex items-center gap-3">
                     {task.assignees && task.assignees.length > 0 ? (
                        task.assignees.map((assignee, i) => (
                             <div key={i} className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-700">
                                    {assignee.user.name?.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="bg-gray-100 px-2 py-0.5 rounded-full text-[10px] text-gray-600 font-medium border border-gray-200">
                                    {assignee.user.name || assignee.user.email}
                                </span>
                             </div>
                        ))
                     ) : (
                         <span className="text-xs text-muted-foreground italic">Non assigné</span>
                     )}
                 </div>
            </div>
        </div>

        {/* Footer / Comments Toggle */}
        <div className="border-t border-border/50 pt-4 flex items-center justify-between cursor-pointer group">
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Commentaires ({task._count?.comments || 0})
            </span>
            <ChevronUp className="h-4 w-4 text-gray-400 group-hover:text-foreground transition-colors" />
        </div>
    </div>
  );
}
