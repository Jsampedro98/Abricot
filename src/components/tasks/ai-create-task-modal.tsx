"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Sparkles, Trash2, Pencil, Plus } from "lucide-react";

import { useCreateTask, useGenerateTasks, useProject } from "@/hooks/use-queries";
import { TaskPriority, TaskStatus } from "@/types";

interface AICreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

interface GeneratedTask {
    id: string;
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string; // YYYY-MM-DD
    assigneeIds: string[];
}

export function AICreateTaskModal({ isOpen, onClose, projectId }: AICreateTaskModalProps) {
  const [prompt, setPrompt] = useState("");
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const { data: project } = useProject(projectId);
  const createTaskMutation = useCreateTask();
  const generateTasksMutation = useGenerateTasks();
  
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<GeneratedTask | null>(null);

  const startEditing = (task: GeneratedTask) => {
    setEditingTaskId(task.id);
    setEditValues({ ...task });
  };

  const saveTask = () => {
    if (!editValues) return;
    setGeneratedTasks(tasks => tasks.map(t => 
        t.id === editingTaskId ? { ...editValues } : t
    ));
    setEditingTaskId(null);
    setEditValues(null);
  };

  const toggleAssignee = (userId: string) => {
      if (!editValues) return;
      const current = editValues.assigneeIds;
      const updated = current.includes(userId)
          ? current.filter(id => id !== userId)
          : [...current, userId];
      setEditValues({ ...editValues, assigneeIds: updated });
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    
    try {
        const result = await generateTasksMutation.mutateAsync({ projectId, prompt });
        const tasks = result as { title: string; description: string; priority?: string; status?: string; dueDate?: string; assigneeName?: string }[];

        const mappedTasks = tasks.map((t, index: number) => {
            // Mapping des tâches générées : Tentative de faire correspondre les noms d'assignés
            // avec les membres du projet existants (Best-effort matching)
            const assigneeIds: string[] = [];
            if (t.assigneeName && project?.members) {
                 const nameToMatch = t.assigneeName.toLowerCase();
                 const found = project.members.find(c => 
                     c.user.email.toLowerCase().includes(nameToMatch) ||
                     (c.user.name && c.user.name.toLowerCase().includes(nameToMatch))
                 );
                 if (found) assigneeIds.push(found.user.id);
            }

            return {
                id: `gen-${Date.now()}-${index}`,
                title: t.title,
                description: t.description,
                priority: (t.priority as TaskPriority) || 'MEDIUM',
                status: (t.status as TaskStatus) || 'TODO',
                dueDate: t.dueDate || "",
                assigneeIds: assigneeIds
            };
        });
        setGeneratedTasks(mappedTasks);
        setHasGenerated(true);
    } catch (error) {
        console.error("Failed to generate tasks", error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleCreateAll = async () => {
    setIsCreating(true);
    try {
        for (const task of generatedTasks) {
            await createTaskMutation.mutateAsync({
                projectId,
                data: {
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    status: task.status,
                    dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
                    assigneeIds: task.assigneeIds
                }
            });
        }
        reset();
        onClose();
    } catch (error) {
        console.error("Failed to create generated tasks", error);
    } finally {
        setIsCreating(false);
    }
  };

  const reset = () => {
    setPrompt("");
    setGeneratedTasks([]);
    setHasGenerated(false);
  };

  const handleDelete = (id: string) => {
      setGeneratedTasks(generatedTasks.filter(t => t.id !== id));
  };

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        className={editingTaskId 
            ? "max-w-xl bg-white shadow-2xl rounded-2xl p-6" // Edit Mode Style
            : "max-w-[800px] !p-0 overflow-hidden bg-white h-[600px] flex flex-col gap-0 shadow-2xl rounded-2xl" // List Mode Style
        }
    >
        {editingTaskId && editValues ? (
             /* EDIT MODE VIEW */
            <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#1A1A1A]">Modifier la tâche</h2>

                 </div>
                 
                 <div className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Titre*</label>
                        <Input 
                            value={editValues.title}
                            onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                            className="bg-gray-50/50 border-gray-200"
                            placeholder="Titre de la tâche"
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Description*</label>
                        <Input 
                             value={editValues.description}
                             onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                             className="bg-gray-50/50 border-gray-200"
                             placeholder="Description"
                        />
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Échéance*</label>
                        <Input 
                            type="date"
                            value={editValues.dueDate}
                            onChange={(e) => setEditValues({ ...editValues, dueDate: e.target.value })}
                            className="bg-gray-50/50 border-gray-200"
                        />
                    </div>

                    {/* Assignees */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Assigné à :</label>
                        <div className="border border-gray-200 rounded-md p-2 max-h-32 overflow-y-auto bg-gray-50/50">
                            {project?.members?.map(member => (
                                <div key={member.user.id} className="flex items-center gap-2 py-1">
                                    <input 
                                        type="checkbox"
                                        id={`ai-assignee-${member.user.id}`}
                                        checked={editValues.assigneeIds.includes(member.user.id)}
                                        onChange={() => toggleAssignee(member.user.id)}
                                        className="rounded border-gray-300 text-black focus:ring-black"
                                    />
                                    <label htmlFor={`ai-assignee-${member.user.id}`} className="text-sm text-gray-700 cursor-pointer flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600">
                                            {member.user.name?.substring(0, 1).toUpperCase()}
                                        </div>
                                        {member.user.name || member.user.email}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Statut :</label>
                        <div className="flex items-center gap-3">
                            {[
                                { val: 'TODO', label: 'À faire', color: 'pink' },
                                { val: 'IN_PROGRESS', label: 'En cours', color: 'orange' },
                                { val: 'DONE', label: 'Terminées', color: 'green' }
                            ].map((s) => (
                                <button
                                    key={s.val}
                                    onClick={() => setEditValues({ ...editValues, status: s.val as TaskStatus })}
                                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                                        editValues.status === s.val
                                        ? `bg-${s.color}-100 text-${s.color}-700 ring-2 ring-${s.color}-200`
                                        : `bg-${s.color}-50 text-${s.color}-600/60 hover:bg-${s.color}-100`
                                    }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Priorité :</label>
                        <div className="flex flex-wrap items-center gap-2">
                            {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setEditValues({ ...editValues, priority: p })}
                                    className={`px-3 py-1 rounded-md text-xs font-bold border transition-all ${
                                        editValues.priority === p
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

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                         <Button variant="ghost" onClick={() => setEditingTaskId(null)}>Annuler</Button>
                         <Button className="bg-[#e5e7eb] hover:bg-[#d1d5db] text-gray-800 font-medium px-6" onClick={saveTask}>Enregistrer</Button>
                    </div>
                 </div>
            </div>
        ) : (
             /* LIST MODE VIEW */
            <>
                {/* Header */}
                <div className="px-8 pt-8 pb-4">
                     <div className="flex items-center gap-3">
                        <Sparkles className="h-6 w-6 text-[#FF6B4A]" fill="#FF6B4A" /> 
                        <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">
                            {hasGenerated ? "Vos tâches..." : "Créer une tâche"}
                        </h2>
                     </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 px-8 relative flex flex-col">
                    <div className="flex-1 overflow-y-auto pb-28 pt-4 scrollbar-hide">
                        {!hasGenerated ? (
                            <div className="h-full flex flex-col items-center justify-center">
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {generatedTasks.map((task, i) => (
                                    <div 
                                        key={task.id} 
                                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all group"
                                        style={{ animationDelay: `${i * 100}ms` }}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-[#1A1A1A] text-lg">{task.title}</h3>
                                        </div>
                                        <p className="text-gray-500 mb-6 font-medium leading-relaxed">{task.description}</p>
                                        
                                        <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleDelete(task.id)}
                                                className="flex items-center gap-1.5 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" /> Supprimer
                                            </button>
                                            <span className="text-gray-300">|</span>
                                            <button 
                                                onClick={() => startEditing(task)}
                                                className="flex items-center gap-1.5 hover:text-[#D95F18] transition-colors"
                                            >
                                                <Pencil className="h-3.5 w-3.5" /> Modifier
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-center mt-8 pb-8">
                                    <Button 
                                        onClick={handleCreateAll}
                                        className="bg-[#1A1A1A] hover:bg-[#333] text-white rounded-lg px-8 py-6 h-auto text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                                        disabled={isCreating}
                                    >
                                        {isCreating ? "Création en cours..." : "+ Ajouter les tâches"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Input */}
                    <div className="absolute bottom-8 left-8 right-8">
                        <form onSubmit={handleGenerate} className="relative">
                            <div className="relative flex items-center bg-[#f9fafb] rounded-full p-2 pr-2 border-0 shadow-none transition-all duration-300 ring-1 ring-transparent focus-within:ring-gray-100">
                                <Input 
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Décrivez les tâches que vous souhaitez ajouter..."
                                    className="w-full bg-transparent border-none h-14 pl-6 pr-16 text-[15px] font-medium placeholder:text-gray-500 focus-visible:ring-0 rounded-full text-gray-900"
                                    disabled={isLoading}
                                />
                                <button 
                                    type="submit"
                                    aria-label="Générer des tâches"
                                    disabled={!prompt.trim() || isLoading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-[#E88B5D] hover:bg-[#D95F18] rounded-full flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-md"
                                >
                                    {isLoading ? (
                                        <Sparkles className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Plus className="h-5 w-5" strokeWidth={3} />
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </>
        )}
    </Modal>
  );
}
