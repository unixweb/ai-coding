"use client";

import { format, isBefore, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarDays, Clock, Pencil, Trash2, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Task,
  TaskStatus,
  TeamMember,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
} from "@/lib/types/task";

interface TaskDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  teamMembers: TeamMember[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onAssigneeChange: (taskId: string, assigneeId: string) => void;
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

const statusOptions: TaskStatus[] = ["todo", "in_progress", "completed"];

export function TaskDetailsSheet({
  open,
  onOpenChange,
  task,
  teamMembers,
  onEdit,
  onDelete,
  onStatusChange,
  onAssigneeChange,
}: TaskDetailsSheetProps) {
  if (!task) return null;

  const assignee = task.assigned_to
    ? teamMembers.find((m) => m.id === task.assigned_to)
    : null;
  const overdue = isOverdue(task.due_date) && task.status !== "completed";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="pr-8 text-left leading-snug">
            {task.title}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Task-Details fuer {task.title}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto py-4">
          {/* Status */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              Status
            </label>
            <Select
              value={task.status}
              onValueChange={(value: string) =>
                onStatusChange(task.id, value as TaskStatus)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  <Badge
                    variant="secondary"
                    className={TASK_STATUS_COLORS[task.status]}
                  >
                    {TASK_STATUS_LABELS[task.status]}
                  </Badge>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    <Badge
                      variant="secondary"
                      className={TASK_STATUS_COLORS[status]}
                    >
                      {TASK_STATUS_LABELS[status]}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" />
              Zustaendige Person
            </label>
            <Select
              value={task.assigned_to ?? "unassigned"}
              onValueChange={(value: string) =>
                onAssigneeChange(
                  task.id,
                  value === "unassigned" ? "" : value
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px]">
                          {getInitials(assignee.name)}
                        </AvatarFallback>
                      </Avatar>
                      {assignee.name}
                    </div>
                  ) : (
                    "Nicht zugewiesen"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Nicht zugewiesen</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Faelligkeitsdatum
            </label>
            {task.due_date ? (
              <p
                className={`text-sm ${
                  overdue ? "font-medium text-destructive" : ""
                }`}
              >
                {format(new Date(task.due_date), "EEEE, dd. MMMM yyyy", {
                  locale: de,
                })}
                {overdue && (
                  <span className="ml-2 text-xs">(Ueberfaellig)</span>
                )}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Kein Datum gesetzt</p>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Beschreibung
            </label>
            {task.description ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {task.description}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                Keine Beschreibung vorhanden
              </p>
            )}
          </div>

          <Separator />

          {/* Metadata */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Erstellt am:{" "}
              {format(new Date(task.created_at), "dd. MMM yyyy, HH:mm", {
                locale: de,
              })}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Zuletzt geaendert:{" "}
              {format(new Date(task.updated_at), "dd. MMM yyyy, HH:mm", {
                locale: de,
              })}
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex gap-2 border-t pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              onOpenChange(false);
              onEdit(task);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Bearbeiten
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onOpenChange(false);
              onDelete(task);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Loeschen
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
