export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface UserShort {
    id: string;
    name: string | null;
    email: string;
}

export interface Project {
    id: string;
    name: string;
    description: string | null;
    createdAt?: string;
    updatedAt?: string;
    owner?: UserShort;
    tasks?: Task[];
    _count?: {
        tasks: number;
        members?: number;
    };
    members?: {
        user: UserShort;
        role: string;
    }[];
}

export interface Comment {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    author: UserShort;
}

export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
    projectId: string;
    project?: {
        id: string;
        name: string;
        description: string | null;
    };
    assignees?: {
        user: UserShort;
    }[];
    comments?: Comment[];
    _count?: {
        comments?: number;
        assignees?: number;
    }
}

export interface DashboardStats {
    tasks: {
        total: number;
        urgent: number;
        overdue: number;
        byStatus: Record<string, number>;
    };
    projects: {
        total: number;
    };
}
