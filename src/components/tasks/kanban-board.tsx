"use client";

import { useCallback, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { useState } from "react";
import { Task, TaskStatus, TeamMember, TASK_STATUS_LABELS } from "@/lib/types/task";
import { TaskCard } from "@/components/tasks/task-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardList } from "lucide-react";

interface KanbanBoardProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  isLoading: boolean;
  onViewDetails: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

const COLUMNS: TaskStatus[] = ["todo", "in_progress", "completed"];

const COLUMN_STYLES: Record<TaskStatus, string> = {
  todo: "border-muted-foreground/20",
  in_progress: "border-blue-500/30",
  completed: "border-green-500/30",
};

const COLUMN_DOT_STYLES: Record<TaskStatus, string> = {
  todo: "bg-muted-foreground",
  in_progress: "bg-blue-500",
  completed: "bg-green-500",
};

function KanbanColumn({
  status,
  tasks,
  teamMembers,
  onViewDetails,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  status: TaskStatus;
  tasks: Task[];
  teamMembers: TeamMember[];
  onViewDetails: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: "column", status },
  });

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  return (
    <div
      className={`flex min-h-[200px] flex-1 flex-col rounded-lg border bg-muted/30 ${
        COLUMN_STYLES[status]
      } ${isOver ? "ring-2 ring-primary/30 bg-muted/50" : ""}`}
    >
      <div className="flex items-center gap-2 border-b px-3 py-2.5">
        <span
          className={`h-2 w-2 rounded-full ${COLUMN_DOT_STYLES[status]}`}
        />
        <h3 className="text-sm font-semibold">{TASK_STATUS_LABELS[status]}</h3>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div
          ref={setNodeRef}
          className="flex min-h-[100px] flex-col gap-2 p-2"
        >
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                teamMembers={teamMembers}
                onViewDetails={onViewDetails}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                isDraggable
              />
            ))}
          </SortableContext>

          {tasks.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
              <ClipboardList className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground/60">
                Keine Tasks
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function KanbanSkeleton() {
  return (
    <div className="flex gap-4">
      {COLUMNS.map((col) => (
        <div key={col} className="flex flex-1 flex-col gap-2 rounded-lg border bg-muted/30 p-3">
          <Skeleton className="h-6 w-24" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function KanbanBoard({
  tasks,
  teamMembers,
  isLoading,
  onViewDetails,
  onEdit,
  onDelete,
  onStatusChange,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      completed: [],
    };
    tasks.forEach((task) => {
      grouped[task.status].push(task);
    });
    // Sort by due_date (overdue first), then by created_at
    Object.values(grouped).forEach((list) => {
      list.sort((a, b) => {
        // Tasks with due dates come first
        if (a.due_date && !b.due_date) return -1;
        if (!a.due_date && b.due_date) return 1;
        if (a.due_date && b.due_date) {
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
    });
    return grouped;
  }, [tasks]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id);
      if (task) setActiveTask(task);
    },
    [tasks]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      // Handled by drag end
    },
    []
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);

      const { active, over } = event;
      if (!over) return;

      const activeTaskId = active.id as string;
      const overData = over.data.current;

      // Determine target status
      let targetStatus: TaskStatus | null = null;

      if (overData?.type === "column") {
        targetStatus = overData.status as TaskStatus;
      } else if (overData?.type === "task") {
        targetStatus = (overData.task as Task).status;
      }

      if (targetStatus) {
        const currentTask = tasks.find((t) => t.id === activeTaskId);
        if (currentTask && currentTask.status !== targetStatus) {
          onStatusChange(activeTaskId, targetStatus);
        }
      }
    },
    [tasks, onStatusChange]
  );

  if (isLoading) {
    return <KanbanSkeleton />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-4 md:flex-row">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            teamMembers={teamMembers}
            onViewDetails={onViewDetails}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="w-[300px] rotate-3 opacity-90">
            <TaskCard
              task={activeTask}
              teamMembers={teamMembers}
              onViewDetails={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
              onStatusChange={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
