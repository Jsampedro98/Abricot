"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskStatus, ProjectMember } from "@/types";
import { useState } from "react";
import { ChevronDown, Calendar } from "lucide-react";
import { authService } from "@/services/api";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projectId?: string;
  projectMembers?: ProjectMember[];
}

interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
}

export function CreateTaskModal({ isOpen, onClose, onSuccess, projectId, projectMembers = [] }: CreateTaskModalProps) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<TaskFormData>({
      defaultValues: {
          status: 'TODO'
      }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const currentStatus = watch("status");

  const onSubmit = async (data: TaskFormData) => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      await authService.createTask(projectId, {
          ...data,
          dueDate: new Date(data.dueDate).toISOString(),
          assigneeIds
      });
      reset();
      setAssigneeIds([]);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to create task", error);
    } finally {
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
    <Modal isOpen={isOpen} onClose={onClose} title="Créer une tâche" className="max-w-xl">
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
            <div className="relative">
                <Input 
                    id="dueDate"
                    type="date"
                    {...register("dueDate", { required: "Une date est requise" })}
                    className="bg-gray-50/50 border-gray-200 pr-10 [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer w-full block" 
                    onClick={(e) => e.currentTarget.showPicker()}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
             {errors.dueDate && <span className="text-red-500 text-xs">{errors.dueDate.message}</span>}
        </div>

         {/* Assigned to */}
        <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Assigné à :</label>
            <div className="border border-gray-200 rounded-md p-2 max-h-32 overflow-y-auto bg-gray-50/50">
                {projectMembers.length > 0 ? (
                    projectMembers.map(member => (
                        <div key={member.user.id} className="flex items-center gap-2 py-1">
                            <input 
                                type="checkbox"
                                id={`assignee-${member.user.id}`}
                                checked={assigneeIds.includes(member.user.id)}
                                onChange={() => toggleAssignee(member.user.id)}
                                className="rounded border-gray-300 text-black focus:ring-black"
                            />
                            <label htmlFor={`assignee-${member.user.id}`} className="text-sm text-gray-700 cursor-pointer flex items-center gap-2">
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

        {/* Submit */}
        <div className="pt-2">
            <Button 
                type="submit" 
                className="bg-[#e5e7eb] hover:bg-[#d1d5db] text-gray-800 w-fit px-6 font-medium"
                disabled={isLoading}
            >
                {isLoading ? "Ajout..." : "+ Ajouter une tâche"}
            </Button>
        </div>

      </form>
    </Modal>
  );
}
