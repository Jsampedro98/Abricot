"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Project } from "@/types";
import { UserSearch } from "@/components/ui/user-search";
import { User } from "@/types/auth";
import { X } from "lucide-react";
import { useUpdateProject, useAddContributor, useRemoveContributor, useUpdateContributorRole } from "@/hooks/use-queries";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

interface ProjectFormData {
  name: string;
  description: string;
}

export function EditProjectModal({ isOpen, onClose, project }: EditProjectModalProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ProjectFormData>({
      defaultValues: {
          name: project.name,
          description: project.description || ""
      }
  });

  const updateContributorRoleMutation = useUpdateContributorRole();
  const updateProjectMutation = useUpdateProject();
  const addContributorMutation = useAddContributor();
  const removeContributorMutation = useRemoveContributor();
  const handleRemoveContributor = (userId: string | number) => {
      removeContributorMutation.mutate({
          projectId: project.id,
          userId: String(userId)
      });
  };

  const handleUpdateRole = (userId: string | number, newRole: 'ADMIN' | 'CONTRIBUTOR') => {
    updateContributorRoleMutation.mutate({
        projectId: project.id,
        userId: String(userId),
        role: newRole
    });
  };

  const onSubmit = (data: ProjectFormData) => {
    updateProjectMutation.mutate({
        id: project.id,
        data
    }, {
        onSuccess: () => {
            onClose();
        }
    });
  };

  const handleAddContributor = (user: User) => {
      addContributorMutation.mutate({
          projectId: project.id,
          email: user.email
      });
  };



  const isLoading = updateProjectMutation.isPending || addContributorMutation.isPending || removeContributorMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier le projet">
      <div className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                    Titre
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
                    Description
                </label>
                <Input 
                    id="description"
                    {...register("description")}
                    className="bg-gray-50/50 border-gray-200"
                />
            </div>

             <div className="pt-2">
                <Button 
                    type="submit" 
                    className="bg-[#1A1A1A] hover:bg-[#333] text-white w-fit px-6"
                    disabled={updateProjectMutation.isPending}
                >
                    {updateProjectMutation.isPending ? "Modification..." : "Enregistrer les modifications"}
                </Button>
            </div>
        </form>

        <div className="border-t border-gray-200 pt-6">
             <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    Gérer les contributeurs
                </label>
                <UserSearch 
                    onSelect={handleAddContributor}
                    excludeUserIds={project.members?.map(m => m.user.id) || []}
                    placeholder="Rechercher un collaborateur..."
                />

                <div className="flex flex-wrap gap-2 mt-4">
                    {project.members && project.members.length > 0 ? (
                        project.members.map(member => (
                            <div key={member.user.id} className="flex items-center gap-2 bg-gray-100 pl-2 pr-1 py-1 rounded-full border border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center text-[9px] font-bold text-gray-700">
                                            {member.user.name?.substring(0, 1).toUpperCase()}
                                        </div>
                                        <span className="text-xs text-gray-700 mr-1">{member.user.name || member.user.email}</span>
                                    </div>
                                    
                                    {project.owner?.id !== member.user.id && (
                                        <div className="flex items-center">
                                            <select 
                                                value={member.role || 'CONTRIBUTOR'}
                                                onChange={(e) => handleUpdateRole(member.user.id, e.target.value as 'ADMIN' | 'CONTRIBUTOR')}
                                                disabled={updateContributorRoleMutation.isPending}
                                                className="h-6 text-[10px] bg-white border border-gray-300 rounded px-1 mr-2 focus:ring-1 focus:ring-black cursor-pointer"
                                            >
                                                <option value="CONTRIBUTOR">Contributeur</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                            <button 
                                                onClick={() => handleRemoveContributor(member.user.id)} 
                                                className="text-gray-400 hover:text-red-500 p-0.5 hover:bg-red-50 rounded-full transition-colors"
                                                disabled={removeContributorMutation.isPending}
                                                title="Retirer du projet"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    )}
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-muted-foreground italic">Aucun contributeur.</p>
                    )}
                </div>
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
