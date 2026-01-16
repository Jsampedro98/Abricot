"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectMember, Task, TaskStatus, TaskPriority } from "@/types";
import { useState, useEffect } from "react";
import { authService } from "@/services/api";
import { Trash2, Send } from "lucide-react";
import { useUpdateTask, useDeleteTask, useTaskComments, useAddComment } from "@/hooks/use-queries";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  projectId: string;
  projectMembers: ProjectMember[];
  userRole?: 'ADMIN' | 'CONTRIBUTOR' | null;
}

interface EditTaskFormData {
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
}

/**
 * EditTaskModal Component
 * 
 * Modal for editing existing tasks.
 * Supports updating task details (title, description, status, priority, due date),
 * managing assignees, and adding/viewing comments.
 * Adjusts UI based on user role (e.g., read-only for contributors).
 */
export function EditTaskModal({ isOpen, onClose, task, projectId, projectMembers, userRole }: EditTaskModalProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EditTaskFormData>({
    defaultValues: {
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
      status: task.status,
      priority: task.priority
    }
  });

  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");
  const currentStatus = watch("status");
  
  const { data: comments = [], isLoading: isCommentsLoading } = useTaskComments(projectId, task.id);
  const addCommentMutation = useAddComment();

  const handleAddComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim()) return;
      
      addCommentMutation.mutate({
          projectId,
          taskId: task.id,
          content: newComment
      }, {
          onSuccess: () => {
              setNewComment("");
          }
      });
  };

  useEffect(() => {
    if (isOpen) {
        setValue("title", task.title);
        setValue("description", task.description || "");
        setValue("dueDate", task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "");
        setValue("status", task.status);
        setValue("priority", task.priority);
        // Initialize assignees
        setAssigneeIds(task.assignees?.map(a => a.user.id) ? task.assignees.map(a => String(a.user.id)) : []);
    }
  }, [isOpen, task, setValue]);

  const onSubmit = (data: EditTaskFormData) => {
    updateTaskMutation.mutate({
        projectId,
        taskId: task.id,
        data: {
            ...data,
            dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
            assigneeIds: assigneeIds
        }
    }, {
        onSuccess: () => {
            onClose();
        }
    });
  };

  const handleDelete = () => {
      if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
          deleteTaskMutation.mutate({
              projectId,
              taskId: task.id
          }, {
              onSuccess: () => {
                  onClose();
              }
          });
      }
  };

  const toggleAssignee = (userId: string) => {
      if (assigneeIds.includes(userId)) {
          setAssigneeIds(assigneeIds.filter(id => id !== userId));
      } else {
          setAssigneeIds([...assigneeIds, userId]);
      }
  };
  
  const isLoading = updateTaskMutation.isPending || deleteTaskMutation.isPending;
  const isContributor = userRole === 'CONTRIBUTOR';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isContributor ? "Détails de la tâche" : "Modifier la tâche"} className="max-w-xl">
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
                                checked={assigneeIds.includes(String(member.user.id))}
                                onChange={() => toggleAssignee(String(member.user.id))}
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
            <div className={`flex items-center gap-3`}>
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
                Priorité :
            </label>
            <div className={`flex flex-wrap items-center gap-2`}>
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

        {/* Comments Section */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
             <h3 className="text-sm font-medium text-foreground">Commentaires</h3>
             
             {/* List */}
             <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                {comments.length > 0 ? (
                    comments.map(comment => (
                        <div key={comment.id} className="bg-gray-50 p-3 rounded-lg text-xs space-y-1">
                            <div className="flex justify-between items-start">
                                <span className="font-semibold text-gray-900">{comment.author?.name || comment.author?.email || 'Utilisateur'}</span>
                                <span className="text-gray-400 text-[10px]">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-600">{comment.content}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-muted-foreground italic">Aucun commentaire pour le moment.</p>
                )}
             </div>

             {/* Add Comment */}
             <div className="flex gap-2">
                 <Input 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    className="bg-white text-xs h-9"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault(); // Prevent form submission
                            handleAddComment(e);
                        }
                    }}
                 />
                 <Button 
                    type="button" 
                    onClick={handleAddComment} 
                    disabled={addCommentMutation.isPending || !newComment.trim()}
                    size="icon"
                    className="h-9 w-9 bg-neutral-900 hover:bg-neutral-800"
                    aria-label="Envoyer le commentaire"
                 >
                     <Send className="h-4 w-4 text-white" />
                 </Button>
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
