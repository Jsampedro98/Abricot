"use client";

import { useAuth } from "@/context/auth-context";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "@/components/dashboard/task-card";
import { CheckSquare, Calendar, Plus, Search, Folder } from "lucide-react";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import { useDashboardStats, useAssignedTasks, useUpdateTask } from "@/hooks/use-queries";
import { ProjectMember } from "@/types";
import { EditTaskModal } from "@/components/tasks/edit-task-modal";
import { authService } from "@/services/api";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

/**
 * DashboardPage Component
 * 
 * The main dashboard view of the application.
 * Displays user's assigned tasks in either List or Kanban view.
 * Allows creating projects, viewing task details, and updating task status via drag-and-drop.
 */
export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const { data: stats, isLoading: isStatsLoading } = useDashboardStats();
  const { data: tasks = [], isLoading: isTasksLoading } = useAssignedTasks();

  const [activeTab, setActiveTab] = useState<"list" | "kanban">("list");
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  
  // Edit Modal State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [projectRole, setProjectRole] = useState<'ADMIN' | 'CONTRIBUTOR' | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [isLoading, user, router]);

  const updateTaskMutation = useUpdateTask();

  const handleViewTask = async (task: Task) => {
    setEditingTask(task);
    // Fetch project to get members
    try {
        const project = await authService.getProject(task.projectId);
        setProjectMembers(project.members || []);
        setProjectRole(project.userRole || null);
    } catch (error) {
        console.error("Failed to fetch project details for task view", error);
        // Optionally show toast/error
    }
  };

  if (isLoading || !user || isStatsLoading || isTasksLoading) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }


  const priorityMap: Record<string, number> = {
    URGENT: 1,
    HIGH: 2,
    MEDIUM: 3,
    LOW: 4
  };

  // Sort tasks by priority (Urgent first)
  const sortedTasks = [...tasks].sort((taskA, taskB) => {
    const weightA = priorityMap[taskA.priority] || 99; // 99 for unknown priority (lowest)
    const weightB = priorityMap[taskB.priority] || 99;
    return weightA - weightB;
  });





  // For List view, we show all sorted tasks. 
  // For Kanban, we filter by current month.
  
  const tasksToDisplay = sortedTasks;



  const todoTasks = tasksToDisplay.filter(t => t.status === "TODO");
  const inProgressTasks = tasksToDisplay.filter(t => t.status === "IN_PROGRESS");
  const doneTasks = tasksToDisplay.filter(t => t.status === "DONE");

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId;

    if (task.status !== newStatus) {
        updateTaskMutation.mutate({
            projectId: task.projectId,
            taskId: task.id,
            data: { status: newStatus }
        });
    }
  };


  return (
    <DashboardLayout title="Tableau de bord">
      <div className="space-y-6">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
               <h2 className="text-2xl font-bold tracking-tight mb-1">Tableau de bord</h2>
               <p className="text-muted-foreground">Bonjour {user.name || user.email}, voici un aperçu de vos projets et tâches</p>
           </div>
           <Button onClick={() => setIsCreateProjectModalOpen(true)} className="bg-[#1A1A1A] hover:bg-[#333] text-white cursor-pointer">
             <Plus className="mr-2 h-4 w-4" /> Créer un projet
           </Button>
        </div>


        <div className="flex items-center gap-3">
            <button
                onClick={() => setActiveTab("list")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    activeTab === "list" 
                    ? "bg-[#FFE4D6] text-[#D95F18]" 
                    : "bg-white text-[#D95F18] hover:bg-[#FFE4D6]/50"
                }`}
            >
                <CheckSquare className="h-5 w-5" />
                Liste
            </button>
            <button
                onClick={() => setActiveTab("kanban")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    activeTab === "kanban" 
                    ? "bg-[#FFE4D6] text-[#D95F18]" 
                    : "bg-white text-[#D95F18] hover:bg-[#FFE4D6]/50"
                }`}
            >
                <Calendar className="h-5 w-5" />
                Kanban
            </button>
        </div>

        {activeTab === "list" && (
            <div className="bg-white rounded-xl border border-border/60 shadow-sm p-4 md:p-6 space-y-6">
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
                    {sortedTasks.map(task => (
                        <TaskCard key={task.id} task={task} view="list" onView={() => handleViewTask(task)} />
                    ))}
                 </div>
            </div>
        )} 
        {activeTab === "kanban" && (
            <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-4">
                {/* TO DO Column */}
                <div className="bg-white rounded-xl border border-border/60 shadow-sm p-5 h-fit">
                    <div className="flex items-center gap-3 mb-6">
                        <h3 className="font-semibold text-base text-foreground">À faire</h3>
                        <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">{todoTasks.length}</span>
                    </div>
                    <Droppable droppableId="TODO">
                        {(provided) => (
                            <div 
                                className="space-y-4 min-h-[100px]"
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {todoTasks.map((task, index) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{ ...provided.draggableProps.style }}
                                            >
                                                <TaskCard task={task} view="kanban" onView={() => handleViewTask(task)} />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>

                {/* IN PROGRESS Column */}
                <div className="bg-white rounded-xl border border-border/60 shadow-sm p-5 h-fit">
                     <div className="flex items-center gap-3 mb-6">
                        <h3 className="font-semibold text-base text-foreground">En cours</h3>
                        <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">{inProgressTasks.length}</span>
                    </div>
                    <Droppable droppableId="IN_PROGRESS">
                        {(provided) => (
                            <div 
                                className="space-y-4 min-h-[100px]"
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {inProgressTasks.map((task, index) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{ ...provided.draggableProps.style }}
                                            >
                                                <TaskCard task={task} view="kanban" onView={() => handleViewTask(task)} />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>

                {/* DONE Column */}
                <div className="bg-white rounded-xl border border-border/60 shadow-sm p-5 h-fit">
                     <div className="flex items-center gap-3 mb-6">
                        <h3 className="font-semibold text-base text-foreground">Terminées</h3>
                        <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">{doneTasks.length}</span>
                    </div>
                     <Droppable droppableId="DONE">
                        {(provided) => (
                            <div 
                                className="space-y-4 min-h-[100px]"
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {doneTasks.map((task, index) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{ ...provided.draggableProps.style }}
                                            >
                                                <TaskCard task={task} view="kanban" onView={() => handleViewTask(task)} />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            </div>
            </DragDropContext>
        )}

      </div>

      <CreateProjectModal 
        isOpen={isCreateProjectModalOpen} 
        onClose={() => setIsCreateProjectModalOpen(false)}
      />

      {editingTask && (
        <EditTaskModal 
            isOpen={!!editingTask}
            onClose={() => setEditingTask(null)}
            task={editingTask}
            projectId={editingTask.projectId}
            projectMembers={projectMembers}
            userRole={projectRole}
        />
      )}
    </DashboardLayout>
  );
}
