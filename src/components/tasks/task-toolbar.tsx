"use client";

import {
  Filter,
  Kanban,
  List,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  TaskFilters,
  TaskFilterStatus,
  TaskFilterAssignee,
  TaskFilterDueDate,
  TeamMember,
  ViewMode,
  TASK_STATUS_LABELS,
} from "@/lib/types/task";

interface TaskToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  teamMembers: TeamMember[];
  onCreateTask: () => void;
  taskCount: number;
}

const DUE_DATE_LABELS: Record<TaskFilterDueDate, string> = {
  all: "Alle",
  today: "Heute",
  this_week: "Diese Woche",
  overdue: "Ueberfaellig",
};

function hasActiveFilters(filters: TaskFilters): boolean {
  return (
    filters.status !== "all" ||
    filters.assignee !== "all" ||
    filters.dueDate !== "all"
  );
}

function countActiveFilters(filters: TaskFilters): number {
  let count = 0;
  if (filters.status !== "all") count++;
  if (filters.assignee !== "all") count++;
  if (filters.dueDate !== "all") count++;
  return count;
}

export function TaskToolbar({
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange,
  teamMembers,
  onCreateTask,
  taskCount,
}: TaskToolbarProps) {
  const activeFilterCount = countActiveFilters(filters);

  const resetFilters = () => {
    onFiltersChange({
      status: "all",
      assignee: "all",
      dueDate: "all",
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button onClick={onCreateTask} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Neuen Task erstellen
          </Button>

          <span className="text-sm text-muted-foreground">
            {taskCount} {taskCount === 1 ? "Task" : "Tasks"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {activeFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Filter</h4>
                  {hasActiveFilters(filters) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs text-muted-foreground"
                      onClick={resetFilters}
                    >
                      Alle zuruecksetzen
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Status Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Status
                  </label>
                  <Select
                    value={filters.status}
                    onValueChange={(value: string) =>
                      onFiltersChange({
                        ...filters,
                        status: value as TaskFilterStatus,
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Status</SelectItem>
                      <SelectItem value="to_do">
                        {TASK_STATUS_LABELS.todo}
                      </SelectItem>
                      <SelectItem value="in_progress">
                        {TASK_STATUS_LABELS.in_progress}
                      </SelectItem>
                      <SelectItem value="completed">
                        {TASK_STATUS_LABELS.completed}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Assignee Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Zustaendige Person
                  </label>
                  <Select
                    value={filters.assignee}
                    onValueChange={(value: string) =>
                      onFiltersChange({
                        ...filters,
                        assignee: value as TaskFilterAssignee,
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Personen</SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Faelligkeitsdatum
                  </label>
                  <Select
                    value={filters.dueDate}
                    onValueChange={(value: string) =>
                      onFiltersChange({
                        ...filters,
                        dueDate: value as TaskFilterDueDate,
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        Object.entries(DUE_DATE_LABELS) as [
                          TaskFilterDueDate,
                          string
                        ][]
                      ).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-6" />

          {/* View Toggle */}
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-r-none px-2.5"
              onClick={() => onViewModeChange("kanban")}
              aria-label="Kanban-Ansicht"
            >
              <Kanban className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-l-none px-2.5"
              onClick={() => onViewModeChange("list")}
              aria-label="Listen-Ansicht"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters(filters) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Aktive Filter:</span>
          {filters.status !== "all" && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Status: {TASK_STATUS_LABELS[filters.status]}
              <button
                onClick={() =>
                  onFiltersChange({ ...filters, status: "all" })
                }
                className="ml-1 hover:text-foreground"
                aria-label="Status-Filter entfernen"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.assignee !== "all" && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Person:{" "}
              {teamMembers.find((m) => m.id === filters.assignee)?.name ??
                "Unbekannt"}
              <button
                onClick={() =>
                  onFiltersChange({ ...filters, assignee: "all" })
                }
                className="ml-1 hover:text-foreground"
                aria-label="Personen-Filter entfernen"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.dueDate !== "all" && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Faellig: {DUE_DATE_LABELS[filters.dueDate]}
              <button
                onClick={() =>
                  onFiltersChange({ ...filters, dueDate: "all" })
                }
                className="ml-1 hover:text-foreground"
                aria-label="Datums-Filter entfernen"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-0.5 text-xs text-muted-foreground"
            onClick={resetFilters}
          >
            Alle entfernen
          </Button>
        </div>
      )}
    </div>
  );
}
