"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/api';
import { LoginPayload, RegisterPayload, User } from '@/types/auth';
import { Project, Task } from '@/types';

// Keys
export const QUERY_KEYS = {
    PROJECTS: ['projects'],
    PROJECT: (id: string) => ['projects', id],
    PROJECT_TASKS: (projectId: string) => ['projects', projectId, 'tasks'],
    DASHBOARD_STATS: ['dashboard', 'stats'],

    ASSIGNED_TASKS: ['dashboard', 'assigned-tasks'],
    USER_PROFILE: ['user', 'profile'],
    TASK_COMMENTS: (taskId: string) => ['tasks', taskId, 'comments'],
};

// --- Projects ---

export function useProjects() {
    return useQuery({
        queryKey: QUERY_KEYS.PROJECTS,
        queryFn: () => authService.getProjects(),
    });
}

export function useProject(id: string) {
    return useQuery({
        queryKey: QUERY_KEYS.PROJECT(id),
        queryFn: () => authService.getProject(id),
        enabled: !!id,
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string; description?: string; contributors?: string[] }) =>
            authService.createProject(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
        },
    });
}

export function useUpdateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string } }) =>
            authService.updateProject(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT(variables.id) });
        },
    });
}

export function useDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => authService.deleteProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
        },
    });
}

export function useAddContributor() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, email }: { projectId: string; email: string }) =>
            authService.addContributor(projectId, email),
        onSuccess: (_, variables) => {
            // Invalidate specific project to refresh members list
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT(variables.projectId) });
        },
    });
}

export function useRemoveContributor() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
            authService.removeContributor(projectId, userId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT(variables.projectId) });
        },
    });
}

export function useUpdateContributorRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, userId, role }: { projectId: string; userId: string; role: 'ADMIN' | 'CONTRIBUTOR' }) =>
            authService.updateContributorRole(projectId, userId, role),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT(variables.projectId) });
        },
    });
}

// --- Tasks ---

export function useProjectTasks(projectId: string) {
    return useQuery({
        queryKey: QUERY_KEYS.PROJECT_TASKS(projectId),
        queryFn: () => authService.getProjectTasks(projectId),
        enabled: !!projectId,
    });
}

export function useCreateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: string; data: any }) =>
            authService.createTask(projectId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_TASKS(variables.projectId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT(variables.projectId) }); // Update counts if any
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSIGNED_TASKS });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
        },
    });
}

export function useUpdateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, taskId, data }: { projectId: string; taskId: string; data: any }) =>
            authService.updateTask(projectId, taskId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_TASKS(variables.projectId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSIGNED_TASKS });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
        },
    });
}

export function useDeleteTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, taskId }: { projectId: string; taskId: string }) =>
            authService.deleteTask(projectId, taskId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_TASKS(variables.projectId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSIGNED_TASKS });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
        },
    });
}

// --- Comments ---

export function useTaskComments(projectId: string, taskId: string) {
    return useQuery({
        queryKey: QUERY_KEYS.TASK_COMMENTS(taskId),
        queryFn: () => authService.getTaskComments(projectId, taskId),
        enabled: !!taskId && !!projectId,
    });
}

export function useAddComment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, taskId, content }: { projectId: string; taskId: string; content: string }) =>
            authService.addComment(projectId, taskId, content),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASK_COMMENTS(variables.taskId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_TASKS(variables.projectId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSIGNED_TASKS });
        },
    });
}

// --- Dashboard ---

export function useDashboardStats() {
    return useQuery({
        queryKey: QUERY_KEYS.DASHBOARD_STATS,
        queryFn: () => authService.getDashboardStats(),
    });
}

export function useAssignedTasks() {
    return useQuery({
        queryKey: QUERY_KEYS.ASSIGNED_TASKS,
        queryFn: () => authService.getAssignedTasks(),
    });
}

export function useGenerateTasks() {
    return useMutation({
        mutationFn: (variables: { projectId: string; prompt: string }) =>
            authService.generateTasks(variables.projectId, variables.prompt),
    });
}
