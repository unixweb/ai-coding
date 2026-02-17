"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Task,
  TaskStatus,
  TaskFormData,
  TaskFilters,
  TeamMember,
  Project,
} from "@/lib/types/task";
import { MOCK_TASKS, MOCK_TEAM_MEMBERS, MOCK_PROJECTS } from "@/lib/mock-data";
import { isAfter, isBefore, startOfDay, endOfDay, endOfWeek, startOfWeek } from "date-fns";

const TASKS_STORAGE_KEY = "kit2_tasks";

function loadTasksFromStorage(): Task[] {
  if (typeof window === "undefined") return MOCK_TASKS;
  try {
    const stored = localStorage.getItem(TASKS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Task[];
    }
  } catch {
    // Fallback to mock data
  }
  return MOCK_TASKS;
}

function saveTasksToStorage(tasks: Task[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Silently fail
  }
}

function generateId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function useTasks(projectId: string) {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      const tasks = loadTasksFromStorage();
      setAllTasks(tasks);
    } catch {
      setError("Fehler beim Laden der Tasks");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter tasks by project
  const tasks = useMemo(
    () => allTasks.filter((t) => t.project_id === projectId),
    [allTasks, projectId]
  );

  const createTask = useCallback(
    (formData: TaskFormData) => {
      const now = new Date().toISOString();
      const newTask: Task = {
        id: generateId(),
        project_id: projectId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        assigned_to: formData.assigned_to || null,
        status: formData.status,
        due_date: formData.due_date || null,
        created_at: now,
        updated_at: now,
      };

      setAllTasks((prev) => {
        const next = [...prev, newTask];
        saveTasksToStorage(next);
        return next;
      });

      return newTask;
    },
    [projectId]
  );

  const updateTask = useCallback(
    (taskId: string, formData: Partial<TaskFormData>) => {
      setAllTasks((prev) => {
        const next = prev.map((task) => {
          if (task.id !== taskId) return task;
          return {
            ...task,
            ...(formData.title !== undefined && {
              title: formData.title.trim(),
            }),
            ...(formData.description !== undefined && {
              description: formData.description.trim(),
            }),
            ...(formData.assigned_to !== undefined && {
              assigned_to: formData.assigned_to || null,
            }),
            ...(formData.status !== undefined && { status: formData.status }),
            ...(formData.due_date !== undefined && {
              due_date: formData.due_date || null,
            }),
            updated_at: new Date().toISOString(),
          };
        });
        saveTasksToStorage(next);
        return next;
      });
    },
    []
  );

  const updateTaskStatus = useCallback(
    (taskId: string, status: TaskStatus) => {
      updateTask(taskId, { status });
    },
    [updateTask]
  );

  const deleteTask = useCallback((taskId: string) => {
    setAllTasks((prev) => {
      const next = prev.filter((t) => t.id !== taskId);
      saveTasksToStorage(next);
      return next;
    });
  }, []);

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  };
}

export function useTeamMembers(): {
  members: TeamMember[];
  isLoading: boolean;
} {
  return {
    members: MOCK_TEAM_MEMBERS,
    isLoading: false,
  };
}

export function useProject(projectId: string): {
  project: Project | null;
  isLoading: boolean;
} {
  const project =
    MOCK_PROJECTS.find((p) => p.id === projectId) ?? null;
  return {
    project,
    isLoading: false,
  };
}

export function useProjects(): {
  projects: Project[];
  isLoading: boolean;
} {
  return {
    projects: MOCK_PROJECTS,
    isLoading: false,
  };
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter((task) => {
    // Status filter
    if (filters.status !== "all" && task.status !== filters.status) {
      return false;
    }

    // Assignee filter
    if (filters.assignee !== "all" && task.assigned_to !== filters.assignee) {
      return false;
    }

    // Due date filter
    if (filters.dueDate !== "all" && task.due_date) {
      const dueDate = new Date(task.due_date);
      const now = new Date();

      switch (filters.dueDate) {
        case "today": {
          const todayStart = startOfDay(now);
          const todayEnd = endOfDay(now);
          if (isBefore(dueDate, todayStart) || isAfter(dueDate, todayEnd)) {
            return false;
          }
          break;
        }
        case "this_week": {
          const weekStart = startOfWeek(now, { weekStartsOn: 1 });
          const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
          if (isBefore(dueDate, weekStart) || isAfter(dueDate, weekEnd)) {
            return false;
          }
          break;
        }
        case "overdue": {
          if (!isBefore(dueDate, startOfDay(now))) {
            return false;
          }
          break;
        }
      }
    } else if (filters.dueDate === "overdue" && !task.due_date) {
      return false;
    } else if (filters.dueDate === "today" && !task.due_date) {
      return false;
    } else if (filters.dueDate === "this_week" && !task.due_date) {
      return false;
    }

    return true;
  });
}
