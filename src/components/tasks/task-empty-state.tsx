"use client";

import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskEmptyStateProps {
  onCreateTask: () => void;
  hasFilters: boolean;
  onResetFilters?: () => void;
}

export function TaskEmptyState({
  onCreateTask,
  hasFilters,
  onResetFilters,
}: TaskEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h3 className="mb-1 text-lg font-semibold">
          Keine Tasks gefunden
        </h3>
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
          Es gibt keine Tasks, die den aktuellen Filtern entsprechen.
          Versuchen Sie, die Filter anzupassen.
        </p>
        {onResetFilters && (
          <Button variant="outline" size="sm" onClick={onResetFilters}>
            Filter zuruecksetzen
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground/40" />
      <h3 className="mb-1 text-lg font-semibold">
        Noch keine Tasks in diesem Projekt
      </h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">
        Erstellen Sie Ihren ersten Task, um die Arbeit zu organisieren und den
        Fortschritt zu verfolgen.
      </p>
      <Button onClick={onCreateTask} size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Ersten Task erstellen
      </Button>
    </div>
  );
}
