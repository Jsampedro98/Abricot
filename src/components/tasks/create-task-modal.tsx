"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectMember, TaskStatus, TaskPriority } from "@/types";
import { useState } from "react";
import { useCreateTask } from "@/hooks/use-queries";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectMembers: ProjectMember[];
}

interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
}

export function CreateTaskModal({ isOpen, onClose, projectId, projectMembers }: CreateTaskModalProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TaskFormData>({
      defaultValues: {
          status: 'TODO',
          priority: 'MEDIUM'
      }
  });

  const createTaskMutation = useCreateTask();
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const currentStatus = watch("status");

  const onSubmit = (data: TaskFormData) => {
    createTaskMutation.mutate({
        projectId,
        data: {
            ...data,
            dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
            assigneeIds
        }
    }, {
        onSuccess: () => {
            reset();
            setAssigneeIds([]);
            onClose();
        }
    });
  };

  const toggleAssignee = (userId: string) => {
      if (assigneeIds.includes(userId)) {
          setAssigneeIds(assigneeIds.filter(id => id !== userId));
      } else {
          setAssigneeIds([...assigneeIds, userId]);
      }
  };

  const isLoading = createTaskMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvelle tâche" className="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Title */}
        <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-foreground">
                Titre*
            </label>
            <Input 
                id="title"
                {...register("title", { required: "Le titre est requis" })}
                placeholder="Ex: Maquette page d'accueil"
                className="bg-gray-50/50 border-gray-200"
            />
            {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
        </div>

        {/* Description */}
        <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
            </label>
            <Input 
                id="description"
                {...register("description")}
                placeholder="Détails de la tâche..."
                className="bg-gray-50/50 border-gray-200"
            />
        </div>

        {/* Echeance / Due Date */}
        <div className="space-y-2">
            <label htmlFor="dueDate" className="text-sm font-medium text-foreground">
                Échéance
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
            <label className="text-sm font-medium text-foreground">Assigné à</label>
            <div className="border border-gray-200 rounded-md p-2 max-h-32 overflow-y-auto bg-gray-50/50">
                {projectMembers && projectMembers.length > 0 ? (
                    projectMembers.map(member => (
                        <div key={member.user.id} className="flex items-center gap-2 py-1">
                            <input 
                                type="checkbox"
                                id={`assignee-${member.user.id}`}
                                checked={assigneeIds.includes(String(member.user.id))}
                                onChange={() => toggleAssignee(String(member.user.id))}
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
                Statut
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

        {/* Priority */}
        <div className="space-y-2">
             <label className="text-sm font-medium text-foreground">
                Priorité
            </label>
            <div className="flex items-center gap-2">
                {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((p) => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => setValue("priority", p)}
                        className={`px-3 py-1 rounded-md text-xs font-bold border transition-all ${
                            watch("priority") === p
                            ? "bg-black text-white border-black" 
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                        }`}
                    >
                        {p === 'LOW' && 'Faible'}
                        {p === 'MEDIUM' && 'Moyenne'}
                        {p === 'HIGH' && 'Élevée'}
                        {p === 'URGENT' && 'Urgente'}
                    </button>
                ))}
            </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
            <Button 
                type="submit" 
                className="bg-[#1A1A1A] hover:bg-[#333] text-white w-full"
                disabled={isLoading}
            >
                {isLoading ? "Création..." : "Créer la tâche"}
            </Button>
        </div>

      </form>
    </Modal>
  );
}
