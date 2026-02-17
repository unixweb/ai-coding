"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Task } from "@/lib/types/task";

interface TaskDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onConfirm: (taskId: string) => void;
}

export function TaskDeleteDialog({
  open,
  onOpenChange,
  task,
  onConfirm,
}: TaskDeleteDialogProps) {
  if (!task) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Task loeschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Sind Sie sicher, dass Sie den Task{" "}
            <span className="font-medium text-foreground">
              &ldquo;{task.title}&rdquo;
            </span>{" "}
            loeschen moechten? Diese Aktion kann nicht rueckgaengig gemacht
            werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm(task.id);
              onOpenChange(false);
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Endgueltig loeschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
