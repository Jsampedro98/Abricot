"use client";

import { useAuth } from "@/context/auth-context";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/api";
import { Task, TaskStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "@/components/dashboard/task-card";
import { CheckSquare, Calendar, Plus, Search } from "lucide-react";




export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<"list" | "kanban">("list");
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user) {
      setIsDataLoading(true);
      authService.getAssignedTasks()
        .then(setTasks)
        .catch(console.error)
        .finally(() => setIsDataLoading(false));
    }
  }, [user]);

  if (isLoading || !user) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  const todoTasks = tasks.filter(t => t.status === "TODO");
  const inProgressTasks = tasks.filter(t => t.status === "IN_PROGRESS");
  const doneTasks = tasks.filter(t => t.status === "DONE");

  return (
    <DashboardLayout title="Tableau de bord">
      <div className="space-y-6">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
               <h2 className="text-2xl font-bold tracking-tight mb-1">Tableau de bord</h2>
               <p className="text-muted-foreground">Bonjour {user.name || user.email}, voici un aperçu de vos projets et tâches</p>
           </div>
           <Button className="bg-[#1A1A1A] hover:bg-[#333] text-white">
             <Plus className="mr-2 h-4 w-4" /> Créer un projet
           </Button>
        </div>


        <div className="flex items-center gap-3">
            <button
                onClick={() => setView("list")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    view === "list" 
                    ? "bg-[#FFE4D6] text-[#D95F18]" 
                    : "bg-white text-[#D95F18] hover:bg-[#FFE4D6]/50"
                }`}
            >
                <CheckSquare className="h-5 w-5" />
                Liste
            </button>
            <button
                onClick={() => setView("kanban")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    view === "kanban" 
                    ? "bg-[#FFE4D6] text-[#D95F18]" 
                    : "bg-white text-[#D95F18] hover:bg-[#FFE4D6]/50"
                }`}
            >
                <Calendar className="h-5 w-5" />
                Kanban
            </button>
        </div>

        {view === "list" ? (
            <div className="bg-white rounded-xl border border-border/60 shadow-sm p-6 space-y-6">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold">Mes tâches assignées</h3>
                        <p className="text-sm text-muted-foreground">Par ordre de priorité</p>
                    </div>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher une tâche" className="pl-9 bg-white border-gray-200" />
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} view="list" />
                    ))}
                 </div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-4">
                {/* TO DO Column */}
                <div className="bg-white rounded-xl border border-border/60 shadow-sm p-5 h-fit">
                    <div className="flex items-center gap-3 mb-6">
                        <h3 className="font-semibold text-base text-foreground">À faire</h3>
                        <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">{todoTasks.length}</span>
                    </div>
                    <div className="space-y-4">
                        {todoTasks.map(task => (
                            <TaskCard key={task.id} task={task} view="kanban" />
                        ))}
                    </div>
                </div>

                {/* IN PROGRESS Column */}
                <div className="bg-white rounded-xl border border-border/60 shadow-sm p-5 h-fit">
                     <div className="flex items-center gap-3 mb-6">
                        <h3 className="font-semibold text-base text-foreground">En cours</h3>
                        <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">{inProgressTasks.length}</span>
                    </div>
                    <div className="space-y-4">
                        {inProgressTasks.map(task => (
                            <TaskCard key={task.id} task={task} view="kanban" />
                        ))}
                    </div>
                </div>

                {/* DONE Column */}
                <div className="bg-white rounded-xl border border-border/60 shadow-sm p-5 h-fit">
                     <div className="flex items-center gap-3 mb-6">
                        <h3 className="font-semibold text-base text-foreground">Terminées</h3>
                        <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">{doneTasks.length}</span>
                    </div>
                    <div className="space-y-4">
                         {doneTasks.map(task => (
                            <TaskCard key={task.id} task={task} view="kanban" />
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </DashboardLayout>
  );
}
