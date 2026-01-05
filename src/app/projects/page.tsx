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

export default function ProjectsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user) {
      setIsDataLoading(true);
      authService.getProjects()
        .then(setProjects)
        .catch(console.error)
        .finally(() => setIsDataLoading(false));
    }
  }, [user]);

  if (isLoading || !user) {
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
           <Button className="bg-[#1A1A1A] hover:bg-[#333] text-white">
             <Plus className="mr-2 h-4 w-4" /> Créer un projet
           </Button>
        </div>

        {/* Projects Grid */}
        {isDataLoading ? (
             <div className="text-center py-12 text-muted-foreground">Chargement des projets...</div>
        ) : projects.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-border/60 bg-gray-50/50">
                <h3 className="test-lg font-medium mb-2">Aucun projet trouvé</h3>
                <p className="text-sm text-muted-foreground mb-6">Commencez par créer votre premier projet pour collaborer.</p>
                <Button className="bg-[#1A1A1A] hover:bg-[#333] text-white">
                    <Plus className="mr-2 h-4 w-4" /> Créer un projet
                </Button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        )}
      </div>
    </DashboardLayout>
  );
}
