"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, isBefore, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import {
  CalendarDays,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Eye,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Task,
  TaskStatus,
  TeamMember,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
} from "@/lib/types/task";

interface TaskCardProps {
  task: Task;
  teamMembers: TeamMember[];
  onViewDetails: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  isDraggable?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return isBefore(new Date(dueDate), startOfDay(new Date()));
}

export function TaskCard({
  task,
  teamMembers,
  onViewDetails,
  onEdit,
  onDelete,
  onStatusChange,
  isDraggable = false,
}: TaskCardProps) {
  const assignee = task.assigned_to
    ? teamMembers.find((m) => m.id === task.assigned_to)
    : null;

  const overdue = isOverdue(task.due_date) && task.status !== "completed";

  const sortable = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
    disabled: !isDraggable,
  });

  const style = isDraggable
    ? {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
      }
    : undefined;

  const statusOptions: TaskStatus[] = ["to_do", "in_progress", "completed"];

  return (
    <Card
      ref={isDraggable ? sortable.setNodeRef : undefined}
      style={style}
      className={`group cursor-pointer transition-shadow hover:shadow-md ${
        sortable.isDragging ? "opacity-50 shadow-lg" : ""
      } ${overdue ? "border-destructive/50" : ""}`}
      role="article"
      aria-label={`Task: ${task.title}`}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          {isDraggable && (
            <button
              {...sortable.attributes}
              {...sortable.listeners}
              className="mt-0.5 cursor-grab touch-none text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 active:cursor-grabbing"
              aria-label="Task verschieben"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3
                className="line-clamp-2 text-sm font-medium leading-snug"
                onClick={() => onViewDetails(task)}
              >
                {task.title}
              </h3>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Task-Aktionen"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onViewDetails(task)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Details anzeigen
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Bearbeiten
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Status aendern
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {statusOptions.map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => onStatusChange(task.id, status)}
                          disabled={task.status === status}
                        >
                          <Badge
                            variant="secondary"
                            className={`mr-2 ${TASK_STATUS_COLORS[status]}`}
                          >
                            {TASK_STATUS_LABELS[status]}
                          </Badge>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(task)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Loeschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {task.description && (
              <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`text-xs ${TASK_STATUS_COLORS[task.status]}`}
              >
                {TASK_STATUS_LABELS[task.status]}
              </Badge>

              {task.due_date && (
                <span
                  className={`flex items-center gap-1 text-xs ${
                    overdue
                      ? "font-medium text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  <CalendarDays className="h-3 w-3" />
                  {format(new Date(task.due_date), "dd. MMM", { locale: de })}
                </span>
              )}

              <div className="flex-1" />

              {assignee ? (
                <div className="flex items-center gap-1">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px]">
                      {getInitials(assignee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {assignee.name.split(" ")[0]}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground/60">
                  Nicht zugewiesen
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
