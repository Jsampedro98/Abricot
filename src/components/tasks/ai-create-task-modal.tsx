"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Sparkles, Trash2, Pencil, Plus } from "lucide-react";

import { useCreateTask } from "@/hooks/use-queries";

interface AICreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

interface GeneratedTask {
    id: string;
    title: string;
    description: string;
}

export function AICreateTaskModal({ isOpen, onClose, projectId }: AICreateTaskModalProps) {
  const [prompt, setPrompt] = useState("");
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const createTaskMutation = useCreateTask();

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    // Request task suggestions based on the user prompt
    // Ideally this would call a backend endpoint
    setTimeout(() => {
        setGeneratedTasks([
            { id: '1', title: 'Campagne Marketing', description: 'Définir les canaux et le budget pour Q1' },
            { id: '2', title: 'Création de visuels', description: 'Briefer l\'équipe design sur les assets' },
            { id: '3', title: 'Analyse concurrentielle', description: 'Étudier les 3 principaux concurrents sur le marché' },
        ]);
        setHasGenerated(true);
        setIsLoading(false);
    }, 1000);
  };

  const handleCreateAll = async () => {
    setIsCreating(true);
    try {
        // Create all tasks sequentially or parallel
        for (const task of generatedTasks) {
            await createTaskMutation.mutateAsync({
                projectId,
                data: {
                    title: task.title,
                    description: task.description,
                    dueDate: undefined, // Or defaulting
                    status: 'TODO',
                    assigneeIds: [],
                    priority: 'MEDIUM' 
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
        className="max-w-[800px] !p-0 overflow-hidden bg-white h-[600px] flex flex-col gap-0 shadow-2xl rounded-2xl"
    >
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
                                    <button className="flex items-center gap-1.5 hover:text-[#D95F18] transition-colors">
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
    </Modal>
  );
}
