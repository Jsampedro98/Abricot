"use client";

import { useAuth } from "@/context/auth-context";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/api";
import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectCard } from "@/components/projects/project-card";
import { CreateProjectModal } from "@/components/projects/create-project-modal";

import { useProjects, useAssignedTasks } from "@/hooks/use-queries";

export default function ProjectsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { data: projects = [], isLoading: isProjectsLoading } = useProjects();
  const { data: tasks = [], isLoading: isTasksLoading } = useAssignedTasks();

  // Calculate Urgency Scores
  const projectsWithScore = projects.map(project => {
      const projectTasks = tasks.filter(t => t.projectId === project.id && t.status !== 'DONE');
      let urgencyScore = 0;
      projectTasks.forEach(task => {
        // Weighted scoring for urgency
        if (task.priority === 'URGENT') urgencyScore += 10;
        else if (task.priority === 'HIGH') urgencyScore += 5;
        else if (task.priority === 'MEDIUM') urgencyScore += 2;
        else urgencyScore += 1; // LOW
      });
      return { ...project, urgencyScore, taskCount: projectTasks.length };
  }).sort((a, b) => b.urgencyScore - a.urgencyScore);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/auth/login");
    }
  }, [isAuthLoading, user, router]);

  if (isAuthLoading || isProjectsLoading) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  return (
    <DashboardLayout title="Projets">
      <div className="space-y-8">
        {/* Header content */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
               <h2 className="text-2xl font-bold tracking-tight mb-1">Mes projets</h2>
               <p className="text-muted-foreground">Gérez vos projets</p>
           </div>
           <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#1A1A1A] hover:bg-[#333] text-white">
             <Plus className="mr-2 h-4 w-4" /> Créer un projet
           </Button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-border/60 bg-gray-50/50">
                <h3 className="test-lg font-medium mb-2">Aucun projet trouvé</h3>
                <p className="text-sm text-muted-foreground mb-6">Commencez par créer votre premier projet pour collaborer.</p>
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#1A1A1A] hover:bg-[#333] text-white">
                    <Plus className="mr-2 h-4 w-4" /> Créer un projet
                </Button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectsWithScore.map(project => (
                    <div key={project.id} className="relative">
                        <ProjectCard project={project} />
                        {project.urgencyScore > 10 && (
                            <span className="absolute -top-2 -right-2 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full border border-red-200 shadow-sm z-10">
                                PRIORITAIRE
                            </span>
                        )}
                    </div>
                ))}
            </div>
        )}
      </div>

      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
      />
    </DashboardLayout>
  );
}

