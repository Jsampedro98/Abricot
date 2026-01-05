"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/api";
import { useState } from "react";
import { Project } from "@/types";
import { Trash2, User as UserIcon } from "lucide-react";
import { UserSearch } from "@/components/ui/user-search";
import { User } from "@/types/auth";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSuccess: () => void;
}

interface EditProjectFormData {
  name: string;
  description: string;
}

export function EditProjectModal({ isOpen, onClose, project, onSuccess }: EditProjectModalProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<EditProjectFormData>({
    defaultValues: {
      name: project.name,
      description: project.description || ""
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isAddingContributor, setIsAddingContributor] = useState(false);

  const onSubmit = async (data: EditProjectFormData) => {
    try {
      setIsLoading(true);
      await authService.updateProject(project.id, data);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update project", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContributor = async (user: User) => {
      try {
          setIsAddingContributor(true);
          await authService.addContributor(project.id, user.email);
          onSuccess(); // Refresh to show new member
      } catch (error) {
          console.error("Failed to add contributor", error);
          alert("Erreur lors de l'ajout. Vérifiez l'email.");
      } finally {
          setIsAddingContributor(false);
      }
  };

  const handleRemoveContributor = async (userId: string) => {
      if (!confirm("Voulez-vous vraiment retirer ce membre ?")) return;
      try {
          await authService.removeContributor(project.id, userId);
          onSuccess(); // Refresh
      } catch (error) {
          console.error("Failed to remove contributor", error);
      }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier un projet">
      <div className="space-y-8">
        {/* Update Details Form */}
        <form id="update-project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                    Titre*
                </label>
                <Input 
                    id="name"
                    {...register("name", { required: "Le titre est requis" })}
                    className="bg-gray-50/50 border-gray-200"
                />
                {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
            </div>

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
        </form>

        <div className="border-t border-gray-100 pt-4 space-y-4">
            <h3 className="text-sm font-medium text-foreground">Contributeurs</h3>
            
            {/* Add Contributor Search */}
            <UserSearch 
                onSelect={handleAddContributor}
                excludeUserIds={project.members?.map(m => m.user.id) || []}
                placeholder="Rechercher un collaborateur..."
            />

            {/* List Members */}
            <div className="space-y-2 max-h-40 overflow-y-auto mt-2">
                {project.members && project.members.length > 0 ? (
                    project.members.map((member) => (
                        <div key={member.user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-700 font-bold">
                                    {member.user.name?.substring(0,2).toUpperCase() || <UserIcon className="h-3 w-3" />}
                                </div>
                                <span className="text-sm text-gray-700">{member.user.name || member.user.email}</span>
                                <span className="text-[10px] text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-100">{member.role}</span>
                            </div>
                            {/* Don't allow removing owner (assuming we can check or backend prevents it) */}
                            {member.role !== 'OWNER' && (
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveContributor(member.user.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-muted-foreground italic">Aucun contributeur.</p>
                )}
            </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex justify-end">
            <Button 
                form="update-project-form"
                type="submit" 
                className="bg-[#e5e7eb] hover:bg-[#d1d5db] text-gray-800 font-medium px-6"
                disabled={isLoading}
            >
                {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
        </div>
      </div>
    </Modal>
  );
}
