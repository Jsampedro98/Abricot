import { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types/auth';
import { DashboardStats, Task, Project } from '@/types';

const API_URL = 'http://localhost:8000';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

class AuthService {
    private getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    }

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

    async createProject(data: { name: string; description?: string }): Promise<Project> {
        const response = await this.request<{ project: Project }>('/projects', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.project;
    }
}

export const authService = new AuthService();
