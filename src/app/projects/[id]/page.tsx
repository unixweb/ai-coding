"use client";

import { useState, useCallback, useMemo } from "react";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, FolderOpen, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  KanbanBoard,
  TaskListView,
  TaskFormDialog,
  TaskDetailsSheet,
  TaskDeleteDialog,
  TaskToolbar,
  TaskEmptyState,
} from "@/components/tasks";
import { useTasks, filterTasks } from "@/hooks/use-tasks-api";
import { useProject } from "@/hooks/use-projects";
import { useTeamMembers } from "@/hooks/use-team";
import {
  Task,
  TaskStatus,
  TaskFormData,
  TaskFilters,
  ViewMode,
} from "@/lib/types/task";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

function ProjectPageSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="flex gap-4">
        <Skeleton className="h-64 flex-1" />
        <Skeleton className="h-64 flex-1" />
        <Skeleton className="h-64 flex-1" />
      </div>
    </div>
  );
}

function ProjectNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground/40" />
      <h2 className="mb-2 text-xl font-semibold">Projekt nicht gefunden</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Das angeforderte Projekt existiert nicht oder Sie haben keinen Zugriff.
      </p>
      <Button asChild variant="outline">
        <Link href="/projects">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurueck zu Projekten
        </Link>
      </Button>
    </div>
  );
}

function ProjectError({ message }: { message: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="mb-4 h-12 w-12 text-destructive/60" />
      <h2 className="mb-2 text-xl font-semibold">Fehler aufgetreten</h2>
      <p className="mb-4 text-sm text-muted-foreground">{message}</p>
      <Button
        variant="outline"
        onClick={() => window.location.reload()}
      >
        Seite neu laden
      </Button>
    </div>
  );
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id: projectId } = use(params);

  const { project, isLoading: projectLoading } = useProject(projectId);
  const {
    tasks,
    isLoading: tasksLoading,
    error: tasksError,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  } = useTasks(projectId);
  const { members: teamMembers } = useTeamMembers(project?.team_id);

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [filters, setFilters] = useState<TaskFilters>({
    status: "all",
    assignee: "all",
    dueDate: "all",
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filtered tasks
  const filteredTasks = useMemo(
    () => filterTasks(tasks, filters),
    [tasks, filters]
  );

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.assignee !== "all" ||
    filters.dueDate !== "all";

  // Handlers
  const handleCreateTask = useCallback(
    (data: TaskFormData) => {
      createTask(data);
      toast.success("Task erstellt", {
        description: `"${data.title}" wurde erfolgreich erstellt.`,
      });
    },
    [createTask]
  );

  const handleEditTask = useCallback(
    (data: TaskFormData) => {
      if (!selectedTask) return;
      updateTask(selectedTask.id, data);
      toast.success("Task aktualisiert", {
        description: `"${data.title}" wurde erfolgreich gespeichert.`,
      });
    },
    [selectedTask, updateTask]
  );

  const handleStatusChange = useCallback(
    (taskId: string, status: TaskStatus) => {
      updateTaskStatus(taskId, status);
      const task = tasks.find((t) => t.id === taskId);
      const statusLabels: Record<TaskStatus, string> = {
        to_do: "To Do",
        in_progress: "In Progress",
        completed: "Completed",
      };
      toast.success("Status geaendert", {
        description: `"${task?.title}" ist jetzt "${statusLabels[status]}".`,
      });
    },
    [updateTaskStatus, tasks]
  );

  const handleAssigneeChange = useCallback(
    (taskId: string, assigneeId: string) => {
      updateTask(taskId, { assigned_to: assigneeId });
      const member = teamMembers.find((m) => m.id === assigneeId);
      toast.success("Zuweisung geaendert", {
        description: member
          ? `Task wurde ${member.name} zugewiesen.`
          : "Zuweisung wurde entfernt.",
      });
    },
    [updateTask, teamMembers]
  );

  const handleDeleteConfirm = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      deleteTask(taskId);
      toast.success("Task geloescht", {
        description: `"${task?.title}" wurde endgueltig geloescht.`,
      });
    },
    [deleteTask, tasks]
  );

  const openViewDetails = useCallback((task: Task) => {
    setSelectedTask(task);
    setDetailsSheetOpen(true);
  }, []);

  const openEdit = useCallback((task: Task) => {
    setSelectedTask(task);
    setEditDialogOpen(true);
  }, []);

  const openDelete = useCallback((task: Task) => {
    setSelectedTask(task);
    setDeleteDialogOpen(true);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ status: "all", assignee: "all", dueDate: "all" });
  }, []);

  // Loading state
  if (projectLoading || tasksLoading) {
    return <ProjectPageSkeleton />;
  }

  // Error state
  if (tasksError) {
    return <ProjectError message={tasksError} />;
  }

  // Not found state
  if (!project) {
    return <ProjectNotFound />;
  }

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Project Header */}
        <div className="space-y-1">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Zurueck zu Projekten
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Task Toolbar */}
        <TaskToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filters={filters}
          onFiltersChange={setFilters}
          teamMembers={teamMembers}
          onCreateTask={() => setCreateDialogOpen(true)}
          taskCount={filteredTasks.length}
        />

        {/* Content Area */}
        {tasks.length === 0 ? (
          <TaskEmptyState
            onCreateTask={() => setCreateDialogOpen(true)}
            hasFilters={false}
          />
        ) : filteredTasks.length === 0 && hasActiveFilters ? (
          <TaskEmptyState
            onCreateTask={() => setCreateDialogOpen(true)}
            hasFilters={true}
            onResetFilters={resetFilters}
          />
        ) : viewMode === "kanban" ? (
          <KanbanBoard
            tasks={filteredTasks}
            teamMembers={teamMembers}
            isLoading={false}
            onViewDetails={openViewDetails}
            onEdit={openEdit}
            onDelete={openDelete}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <TaskListView
            tasks={filteredTasks}
            teamMembers={teamMembers}
            isLoading={false}
            onViewDetails={openViewDetails}
            onEdit={openEdit}
            onDelete={openDelete}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>

      {/* Dialogs and Sheets */}
      <TaskFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        teamMembers={teamMembers}
        onSubmit={handleCreateTask}
      />

      <TaskFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        task={selectedTask}
        teamMembers={teamMembers}
        onSubmit={handleEditTask}
      />

      <TaskDetailsSheet
        open={detailsSheetOpen}
        onOpenChange={setDetailsSheetOpen}
        task={selectedTask}
        teamMembers={teamMembers}
        onEdit={openEdit}
        onDelete={openDelete}
        onStatusChange={handleStatusChange}
        onAssigneeChange={handleAssigneeChange}
      />

      <TaskDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        task={selectedTask}
        onConfirm={handleDeleteConfirm}
      />

      <Toaster />
    </>
  );
}
