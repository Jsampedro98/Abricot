"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectMember, Task, TaskStatus } from "@/types";
import { useState, useEffect } from "react";
import { authService } from "@/services/api";
import { Trash2 } from "lucide-react";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  projectId: string;
  projectMembers: ProjectMember[];
  onSuccess: () => void;
}

interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
}

export function EditTaskModal({ isOpen, onClose, task, projectId, projectMembers, onSuccess }: EditTaskModalProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TaskFormData>({
      defaultValues: {
          title: task.title,
          description: task.description || "",
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
          status: task.status
      }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const currentStatus = watch("status");

  useEffect(() => {
      if (task) {
          setAssigneeIds(task.assignees?.map(a => a.user.id) || []);
      }
  }, [task]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsLoading(true);
      await authService.updateTask(projectId, task.id, {
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
          assigneeIds
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update task", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
      if (!confirm("Supprimer cette tâche ?")) return;
      try {
          setIsLoading(true);
          await authService.deleteTask(projectId, task.id);
          onSuccess();
          onClose();
      } catch (error) {
           console.error("Failed to delete task", error);
           setIsLoading(false);
      }
  };

  const toggleAssignee = (userId: string) => {
      if (assigneeIds.includes(userId)) {
          setAssigneeIds(assigneeIds.filter(id => id !== userId));
      } else {
          setAssigneeIds([...assigneeIds, userId]);
      }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier la tâche" className="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Title */}
        <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-foreground">
                Titre*
            </label>
            <Input 
                id="title"
                {...register("title", { required: "Le titre est requis" })}
                className="bg-gray-50/50 border-gray-200"
            />
            {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
        </div>

        {/* Description */}
        <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
                Description*
            </label>
            <Input 
                id="description"
                {...register("description")}
                className="bg-gray-50/50 border-gray-200"
            />
        </div>

        {/* Echeance / Due Date */}
        <div className="space-y-2">
            <label htmlFor="dueDate" className="text-sm font-medium text-foreground">
                Échéance*
            </label>
            <Input 
                id="dueDate"
                type="date"
                {...register("dueDate")}
                className="bg-gray-50/50 border-gray-200"
            />
        </div>

         {/* Assigned to */}
        <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Assigné à :</label>
            <div className="border border-gray-200 rounded-md p-2 max-h-32 overflow-y-auto bg-gray-50/50">
                {projectMembers && projectMembers.length > 0 ? (
                    projectMembers.map(member => (
                        <div key={member.user.id} className="flex items-center gap-2 py-1">
                            <input 
                                type="checkbox"
                                id={`edit-assignee-${member.user.id}`}
                                checked={assigneeIds.includes(member.user.id)}
                                onChange={() => toggleAssignee(member.user.id)}
                                className="rounded border-gray-300 text-black focus:ring-black"
                            />
                            <label htmlFor={`edit-assignee-${member.user.id}`} className="text-sm text-gray-700 cursor-pointer flex items-center gap-2">
                                <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600">
                                    {member.user.name?.substring(0, 1).toUpperCase()}
                                </div>
                                {member.user.name || member.user.email}
                            </label>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-muted-foreground italic">Aucun membre dans ce projet.</p>
                )}
            </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
             <label className="text-sm font-medium text-foreground">
                Statut :
            </label>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setValue("status", "TODO")}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                        currentStatus === 'TODO' 
                        ? "bg-pink-100 text-pink-700 ring-2 ring-pink-200" 
                        : "bg-pink-50 text-pink-600/60 hover:bg-pink-100"
                    }`}
                >
                    À faire
                </button>
                <button
                     type="button"
                     onClick={() => setValue("status", "IN_PROGRESS")}
                     className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                        currentStatus === 'IN_PROGRESS' 
                        ? "bg-orange-100 text-orange-700 ring-2 ring-orange-200" 
                        : "bg-orange-50 text-orange-600/60 hover:bg-orange-100"
                    }`}
                >
                    En cours
                </button>
                <button
                     type="button"
                     onClick={() => setValue("status", "DONE")}
                     className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                        currentStatus === 'DONE' 
                        ? "bg-green-100 text-green-700 ring-2 ring-green-200" 
                        : "bg-green-50 text-green-600/60 hover:bg-green-100"
                    }`}
                >
                    Terminées
                </button>
            </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-between items-center">
            <button 
                type="button"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 text-sm flex items-center gap-2"
            >
                <Trash2 className="h-4 w-4" /> Supprimer la tâche
            </button>

            <Button 
                type="submit" 
                className="bg-[#e5e7eb] hover:bg-[#d1d5db] text-gray-800 font-medium px-6"
                disabled={isLoading}
            >
                {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
        </div>

      </form>
    </Modal>
  );
}
