"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isBefore, startOfDay, format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Task,
  TaskFormData,
  TeamMember,
  TASK_STATUS_LABELS,
  TaskStatus,
} from "@/lib/types/task";

const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, "Task-Titel ist erforderlich")
    .max(200, "Task-Titel darf maximal 200 Zeichen lang sein"),
  description: z.string(),
  assigned_to: z.string(),
  status: z.enum(["to_do", "in_progress", "completed"]),
  due_date: z.string(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  teamMembers: TeamMember[];
  onSubmit: (data: TaskFormData) => void;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  teamMembers,
  onSubmit,
}: TaskFormDialogProps) {
  const isEdit = !!task;

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      assigned_to: "",
      status: "to_do",
      due_date: "",
    },
  });

  // Reset form when dialog opens/task changes
  useEffect(() => {
    if (open) {
      if (task) {
        form.reset({
          title: task.title,
          description: task.description,
          assigned_to: task.assigned_to ?? "",
          status: task.status,
          due_date: task.due_date
            ? format(new Date(task.due_date), "yyyy-MM-dd")
            : "",
        });
      } else {
        form.reset({
          title: "",
          description: "",
          assigned_to: "",
          status: "to_do",
          due_date: "",
        });
      }
    }
  }, [open, task, form]);

  const dueDateValue = form.watch("due_date");
  const isPastDate =
    dueDateValue &&
    isBefore(new Date(dueDateValue), startOfDay(new Date()));

  const handleSubmit = (values: TaskFormValues) => {
    onSubmit({
      title: values.title,
      description: values.description,
      assigned_to: values.assigned_to,
      status: values.status,
      due_date: values.due_date
        ? new Date(values.due_date).toISOString()
        : "",
    });
    onOpenChange(false);
  };

  const statusOptions: TaskStatus[] = ["to_do", "in_progress", "completed"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Task bearbeiten" : "Neuen Task erstellen"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Aendern Sie die Task-Details und speichern Sie."
              : "Fuellen Sie die Details fuer den neuen Task aus."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Titel <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="z.B. Login-Seite implementieren"
                      maxLength={200}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    {field.value.length}/200 Zeichen
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Beschreiben Sie den Task..."
                      className="min-h-[80px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zustaendige Person</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Nicht zugewiesen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">
                          Nicht zugewiesen
                        </SelectItem>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {TASK_STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faelligkeitsdatum</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isPastDate && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Das Faelligkeitsdatum liegt in der Vergangenheit.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">
                {isEdit ? "Aenderungen speichern" : "Task erstellen"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
