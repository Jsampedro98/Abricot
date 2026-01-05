"use client";

import { Project } from "@/types";
import { Users } from "lucide-react";
import Link from "next/link";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Mock calculations for progress if not provided
  const totalTasks = project._count?.tasks || 0;
  const completedTasks = project.tasks?.filter(t => t.status === 'DONE').length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white rounded-xl border border-border/60 p-6 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between group">
        <div>
          <h3 className="text-lg font-semibold text-foreground group-hover:text-[#D95F18] transition-colors mb-2">
            {project.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] mb-6">
            {project.description || "Aucune description pour ce projet."}
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Progression</span>
                <span className="text-foreground">{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-[#1A1A1A] rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-[10px] text-muted-foreground">
                {completedTasks}/{totalTasks} tâches terminées
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-border/50 space-y-3">
            <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">Équipe ({project.members?.length || 0})</span>
            </div>
            
             <div className="flex items-center">
                 <div className="flex items-center gap-2 mr-3">
                     <div className="h-8 w-8 rounded-full bg-[#FFE4D6] flex items-center justify-center border-2 border-white shadow-sm z-10">
                        <span className="text-xs font-bold text-[#5E3A2A]">
                            {project.owner?.name?.substring(0,2).toUpperCase() || '?'}
                        </span>
                     </div>
                     <span className="bg-[#FFE4D6] px-2.5 py-1 rounded-full text-[10px] font-medium text-[#D95F18]">
                        Propriétaire
                     </span>
                 </div>
                 
                 {project.members && project.members.length > 0 && (
                     <div className="flex items-center -space-x-2">
                        {project.members.slice(0, 3).map((member, i) => (
                             <div key={i} className="h-8 w-8 rounded-full bg-[#F3F4F6] flex items-center justify-center border-2 border-white shadow-sm">
                                <span className="text-xs font-bold text-gray-700">
                                    {member.user.name?.substring(0, 2).toUpperCase() || "??"}
                                </span>
                             </div>
                        ))}
                     </div>
                 )}
            </div>
        </div>
      </div>
    </Link>
  );
}
