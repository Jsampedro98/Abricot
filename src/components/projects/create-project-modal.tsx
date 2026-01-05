"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/api";
import { useState } from "react";
import { UserSearch } from "@/components/ui/user-search";
import { User } from "@/types/auth";
import { X } from "lucide-react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ProjectFormData {
  name: string;
  description: string;
}

export function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContributors, setSelectedContributors] = useState<User[]>([]);

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setIsLoading(true);
      // Backend expects emails for contributors
      await authService.createProject({
          ...data,
          contributors: selectedContributors.map(u => u.email)
      });
      reset();
      setSelectedContributors([]);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to create project", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addContributor = (user: User) => {
      if (!selectedContributors.find(u => u.id === user.id)) {
          setSelectedContributors([...selectedContributors, user]);
      }
  };

  const removeContributor = (userId: string) => {
      setSelectedContributors(selectedContributors.filter(u => u.id !== userId));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer un projet">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Name Input */}
        <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
                Titre*
            </label>
            <Input 
                id="name"
                {...register("name", { required: "Le titre est requis" })}
                placeholder="Platforme de Formation"
                className="bg-gray-50/50 border-gray-200"
            />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
        </div>

        {/* Description Input */}
        <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
                Description*
            </label>
            <Input 
                id="description"
                {...register("description", { required: "La description est requise" })}
                placeholder="Système de gestion..."
                className="bg-gray-50/50 border-gray-200"
            />
             {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
        </div>

        {/* Contributors Selection */}
        <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
                Contributeurs
            </label>
            <UserSearch 
                onSelect={addContributor}
                excludeUserIds={selectedContributors.map(u => u.id)}
                placeholder="Ajouter des collaborateurs..."
            />
            
            {/* Selected Contributors Chips */}
            {selectedContributors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedContributors.map(user => (
                        <div key={user.id} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                             <div className="h-4 w-4 rounded-full bg-gray-300 flex items-center justify-center text-[8px] font-bold text-gray-700">
                                {user.name?.substring(0, 1).toUpperCase()}
                            </div>
                            <span className="text-xs text-gray-700">{user.name || user.email}</span>
                            <button type="button" onClick={() => removeContributor(user.id)} className="text-gray-400 hover:text-red-500">
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
            <Button 
                type="submit" 
                className="bg-[#1A1A1A] hover:bg-[#333] text-white w-fit px-6"
                disabled={isLoading}
            >
                {isLoading ? "Création..." : "Ajouter un projet"}
            </Button>
        </div>

      </form>
    </Modal>
  );
}
