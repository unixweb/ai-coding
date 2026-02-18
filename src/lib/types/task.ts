export type TaskStatus = "to_do" | "in_progress" | "completed";

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  assigned_to: string | null;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  assigned_to: string | null;
  status: TaskStatus;
  due_date: string | null;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export type TaskFilterStatus = TaskStatus | "all";
export type TaskFilterAssignee = string | "all";
export type TaskFilterDueDate = "all" | "today" | "this_week" | "overdue";

export interface TaskFilters {
  status: TaskFilterStatus;
  assignee: TaskFilterAssignee;
  dueDate: TaskFilterDueDate;
}

export type ViewMode = "kanban" | "list";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  to_do: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  to_do: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};
