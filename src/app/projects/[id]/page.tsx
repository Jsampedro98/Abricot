"use client";

import { useAuth } from "@/context/auth-context";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authService } from "@/services/api";
import { Project, Task } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Plus, MoreHorizontal, ChevronDown, ChevronUp, Search, Calendar as CalendarIcon, CheckSquare } from "lucide-react";
import Link from "next/link";
import { ProjectTaskCard } from "@/components/projects/project-task-card";
import { Input } from "@/components/ui/input";

export default function ProjectDetailsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"list" | "calendar">("list");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user && projectId) {
      setIsDataLoading(true);
      // Fetch project details and tasks
      Promise.all([
          authService.getProject(projectId),
          authService.getAssignedTasks()
      ])
      .then(([projectData, tasksData]) => {
          setProject(projectData);
          setTasks(tasksData.filter(t => t.projectId === projectId)); 
      })
      .catch(console.error)
      .finally(() => setIsDataLoading(false));
    }
  }, [user, projectId]);

  if (isLoading || !user || isDataLoading) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  if (!project) {
      return <div>Projet introuvable</div>;
  }

  return (
    <DashboardLayout title={project.name}>
      <div className="space-y-6">
        {/* Header Content with Back Button */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
           <div className="flex items-start gap-4">
               <Link href="/projects" className="mt-1">
                    <Button variant="outline" size="icon" className="bg-white border-border/60 shadow-sm h-10 w-10">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
               </Link>
               <div>
                   <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold tracking-tight">{project.name}</h2>
                        <span className="text-sm font-medium text-[#D95F18] cursor-pointer hover:underline">Modifier</span>
                   </div>
                   <p className="text-muted-foreground">{project.description || "Aucune description"}</p>
               </div>
           </div>
           <div className="flex items-center gap-3">
               <Button className="bg-[#1A1A1A] hover:bg-[#333] text-white">
                 <Plus className="mr-2 h-4 w-4" /> Créer une tâche
               </Button>
               <Button className="bg-[#D95F18] hover:bg-[#D95F18]/90 text-white">
                 <Sparkles className="mr-2 h-4 w-4" /> IA
               </Button>
           </div>
        </div>

        {/* Contributors Bar */}
        <div className="bg-[#f3f4f6] border border-transparent rounded-lg p-3 flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">Contributeurs</span>
            <span className="text-sm text-muted-foreground">{project.members?.length || 0} personnes</span>
            
            <div className="hidden md:flex items-center gap-4 ml-4">
                 {project.owner && (
                    <div className="flex items-center gap-2">
                         <div className="h-6 w-6 rounded bg-[#FFE4D6] flex items-center justify-center text-[10px] font-bold text-[#5E3A2A]">
                            {project.owner.name?.substring(0,2).toUpperCase() || '?'}
                        </div>
                        <span className="bg-[#FFE4D6] px-2.5 py-0.5 rounded-full text-xs font-medium text-[#D95F18]">
                            Propriétaire
                        </span>
                    </div>
                 )}
                 <div className="flex items-center gap-2">
                     <div className="h-6 w-6 rounded bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-700">BD</div>
                     <span className="bg-gray-100 px-2.5 py-0.5 rounded-full text-xs text-gray-600 border border-gray-200">
                        Bertrand Dupont
                     </span>
                 </div>
                 <div className="flex items-center gap-2">
                     <div className="h-6 w-6 rounded bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-700">AD</div>
                     <span className="bg-gray-100 px-2.5 py-0.5 rounded-full text-xs text-gray-600 border border-gray-200">
                        Anne Dupont
                     </span>
                 </div>
            </div>
        </div>

        {/* Content Tabs & Filters - WRAPPED IN WHITE CARD */}
         <div className="bg-white p-8 rounded-xl border border-border/60 shadow-sm space-y-8">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                         <h3 className="text-lg font-bold text-foreground">Tâches</h3>
                         <span className="text-sm text-muted-foreground">Par ordre de priorité</span>
                    </div>

                    <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100">
                            <button
                                onClick={() => setActiveTab("list")}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === "list" ? "bg-[#FFE4D6] text-[#D95F18] shadow-sm" : "text-gray-500 hover:text-foreground"}`}
                            >
                                <CheckSquare className="h-3.5 w-3.5" />
                                Liste
                            </button>
                            <button
                                onClick={() => setActiveTab("calendar")}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === "calendar" ? "bg-[#FFE4D6] text-[#D95F18] shadow-sm" : "text-gray-500 hover:text-foreground"}`}
                            >
                                <CalendarIcon className="h-3.5 w-3.5" />
                                Calendrier
                            </button>
                         </div>

                         <div className="flex items-center gap-3">
                             <Button variant="outline" className="bg-white text-muted-foreground text-sm font-normal border-gray-200 h-10 px-4">
                                 Statut <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                             </Button>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Rechercher une tâche" className="pl-10 bg-white border-gray-200 h-10 text-sm" />
                            </div>
                        </div>
                    </div>
                 </div>
                 
                 {/* Task List */}
                 <div className="space-y-4">
                    {tasks.length > 0 ? (
                        tasks.map(task => (
                             <ProjectTaskCard key={task.id} task={task} />
                        ))
                    ) : (
                        <div className="text-center py-12 text-neutral-500 text-sm">
                            Aucune tâche pour le moment.
                        </div>
                    )}
                 </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
