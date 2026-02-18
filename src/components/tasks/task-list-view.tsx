"use client";

import { format, isBefore, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import {
  MoreHorizontal,
  Pencil,
  Eye,
  Trash2,
  ArrowRight,
  ArrowUpDown,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useState, useMemo } from "react";

interface TaskListViewProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  isLoading: boolean;
  onViewDetails: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

type SortField = "title" | "status" | "assignee" | "due_date";
type SortDirection = "asc" | "desc";

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

function ListSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Zustaendig</TableHead>
            <TableHead>Faelligkeitsdatum</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-6" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function TaskListView({
  tasks,
  teamMembers,
  isLoading,
  onViewDetails,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskListViewProps) {
  const [sortField, setSortField] = useState<SortField>("due_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const statusOptions: TaskStatus[] = ["to_do", "in_progress", "completed"];

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedTasks = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title, "de");
          break;
        case "status": {
          const statusOrder: Record<TaskStatus, number> = {
            to_do: 0,
            in_progress: 1,
            completed: 2,
          };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        }
        case "assignee": {
          const nameA =
            teamMembers.find((m) => m.id === a.assigned_to)?.name ?? "zzz";
          const nameB =
            teamMembers.find((m) => m.id === b.assigned_to)?.name ?? "zzz";
          comparison = nameA.localeCompare(nameB, "de");
          break;
        }
        case "due_date": {
          if (!a.due_date && !b.due_date) comparison = 0;
          else if (!a.due_date) comparison = 1;
          else if (!b.due_date) comparison = -1;
          else
            comparison =
              new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          break;
        }
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [tasks, sortField, sortDirection, teamMembers]);

  if (isLoading) {
    return <ListSkeleton />;
  }

  if (tasks.length === 0) {
    return null; // Empty state is handled by parent
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8"
                onClick={() => toggleSort("title")}
              >
                Titel
                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8"
                onClick={() => toggleSort("status")}
              >
                Status
                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
              </Button>
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8"
                onClick={() => toggleSort("assignee")}
              >
                Zustaendig
                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8"
                onClick={() => toggleSort("due_date")}
              >
                Faellig
                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
              </Button>
            </TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Aktionen</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTasks.map((task) => {
            const assignee = task.assigned_to
              ? teamMembers.find((m) => m.id === task.assigned_to)
              : null;
            const overdue =
              isOverdue(task.due_date) && task.status !== "completed";

            return (
              <TableRow
                key={task.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onViewDetails(task)}
              >
                <TableCell className="max-w-[200px] font-medium">
                  <span className="line-clamp-1">{task.title}</span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={TASK_STATUS_COLORS[task.status]}
                  >
                    {TASK_STATUS_LABELS[task.status]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(assignee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Nicht zugewiesen
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {task.due_date ? (
                    <span
                      className={
                        overdue
                          ? "font-medium text-destructive"
                          : "text-sm text-muted-foreground"
                      }
                    >
                      {format(new Date(task.due_date), "dd. MMM yyyy", {
                        locale: de,
                      })}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Task-Aktionen"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(task);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Details anzeigen
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(task);
                        }}
                      >
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
                              onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(task.id, status);
                              }}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(task);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Loeschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
