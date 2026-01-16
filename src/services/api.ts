import { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types/auth';
import { DashboardStats, Task, Project, Comment } from '@/types';

const API_URL = 'http://localhost:8000';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

/**
 * Service gérant toutes les communications avec l'API backend.
 * Inclut la gestion automatique du token d'authentification.
 */
class AuthService {
    /**
     * Récupère le token JWT stocké dans le localStorage.
     * @returns Le token ou null si non présent/environnement serveur.
     */
    private getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    }

    /**
     * Méthode générique pour effectuer les requêtes API.
     * Injecte automatiquement le header Authorization si un token est présent.
     * Gère la sérialisation JSON et les erreurs HTTP.
     */
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const token = this.getToken();

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const body = await response.json();

        if (!response.ok) {
            throw new Error(body.message || 'Une erreur est survenue');
        }

        return (body as ApiResponse<T>).data;
    }

    async login(payload: LoginPayload): Promise<AuthResponse> {
        return this.request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async register(payload: RegisterPayload): Promise<AuthResponse> {
        return this.request<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async getProfile(): Promise<User> {
        const response = await this.request<{ user: User }>('/auth/profile', {
            method: 'GET',
        });
        return response.user;
    }

    async updateProfile(data: { name?: string; email?: string }): Promise<User> {
        const response = await this.request<{ user: User }>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return response.user;
    }

    async updatePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<void> {
        await this.request('/auth/password', {
            method: 'PUT',
            body: JSON.stringify(passwordData),
        });
    }

    async getDashboardStats(): Promise<DashboardStats> {
        const response = await this.request<{ stats: DashboardStats }>('/dashboard/stats');
        return response.stats;
    }

    async getAssignedTasks(): Promise<Task[]> {
        const response = await this.request<{ tasks: Task[] }>('/dashboard/assigned-tasks');
        return response.tasks;
    }

    async getProjects(): Promise<Project[]> {
        const response = await this.request<{ projects: Project[] }>('/projects');
        return response.projects;
    }

    async getProject(id: string): Promise<Project> {
        const response = await this.request<{ project: Project }>(`/projects/${id}`);
        return response.project;
    }

    async createProject(data: { name: string; description?: string; contributors?: string[] }): Promise<Project> {
        const response = await this.request<{ project: Project }>('/projects', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.project;
    }

    async updateProject(id: string, data: { name?: string; description?: string }): Promise<Project> {
        const response = await this.request<{ project: Project }>(`/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return response.project;
    }

    async deleteProject(id: string): Promise<void> {
        await this.request(`/projects/${id}`, {
            method: 'DELETE',
        });
    }

    async addContributor(projectId: string, email: string): Promise<void> {
        await this.request(`/projects/${projectId}/contributors`, {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    async removeContributor(projectId: string, userId: string): Promise<void> {
        await this.request(`/projects/${projectId}/contributors/${userId}`, {
            method: 'DELETE',
        });
    }

    async updateContributorRole(projectId: string, userId: string, role: 'ADMIN' | 'CONTRIBUTOR'): Promise<void> {
        await this.request(`/projects/${projectId}/contributors/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ role }),
        });
    }

    async searchUsers(query: string): Promise<User[]> {
        const response = await this.request<{ users: User[] }>(`/users/search?query=${encodeURIComponent(query)}`);
        return response.users || [];
    }

    async createTask(projectId: string, data: { title: string; description?: string; priority?: string; dueDate?: string; assigneeIds?: string[]; status?: string }): Promise<Task> {
        const response = await this.request<{ task: Task }>(`/projects/${projectId}/tasks`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.task;
    }

    async updateTask(projectId: string, taskId: string, data: { title?: string; description?: string; status?: string; priority?: string; dueDate?: string; assigneeIds?: string[] }): Promise<Task> {
        console.log('Update task', projectId, taskId, data);
        const response = await this.request<{ task: Task }>(`/projects/${projectId}/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return response.task;
    }

    async getProjectTasks(projectId: string): Promise<Task[]> {
        const response = await this.request<{ tasks: Task[] }>(`/projects/${projectId}/tasks`);
        return response.tasks;
    }

    async deleteTask(projectId: string, taskId: string): Promise<void> {
        await this.request(`/projects/${projectId}/tasks/${taskId}`, {
            method: 'DELETE',
        });
    }

    async getTaskComments(projectId: string, taskId: string): Promise<Comment[]> {
        const response = await this.request<{ comments: Comment[] }>(`/projects/${projectId}/tasks/${taskId}/comments`);
        return response.comments;
    }

    async addComment(projectId: string, taskId: string, content: string): Promise<Comment> {
        const response = await this.request<{ comment: Comment }>(`/projects/${projectId}/tasks/${taskId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
        return response.comment;
    }

    // AI Generation
    async generateTasks(projectId: string, prompt: string): Promise<any[]> {
        const response = await this.request<any[]>(`/projects/${projectId}/ai/generate`, {
            method: 'POST',
            body: JSON.stringify({ prompt })
        });
        return response;
    }
}

export const authService = new AuthService();
