"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ArrowRight, FolderOpen, Plus, MoreVertical, Pencil, Trash2, Archive, ArchiveRestore, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useProjects, Project } from "@/hooks/use-projects";
import { ProjectDialog } from "@/components/project-dialog";
import { toast } from "sonner";

export default function ProjectsPage() {
  const { projects, isLoading, refetch, deleteProject, updateProject } = useProjects();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived'>('active');

  // Filter projects by status
  const filteredProjects = useMemo(() => {
    return projects.filter(p => p.status === statusFilter);
  }, [projects, statusFilter]);

  const handleEdit = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedProject(project);
    setDialogOpen(true);
  };

  const handleDelete = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleArchive = async (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    const newStatus = project.status === 'active' ? 'archived' : 'active';
    try {
      await updateProject(project.id, { status: newStatus });
      toast.success(newStatus === 'archived' ? 'Projekt archiviert!' : 'Projekt reaktiviert!');
    } catch (error) {
      toast.error('Fehler beim Aktualisieren');
    }
  };

  const confirmDelete = async () => {
    if (!selectedProject) return;

    setDeleting(true);
    try {
      await deleteProject(selectedProject.id);
      toast.success("Projekt gelöscht!");
      setDeleteDialogOpen(false);
      setSelectedProject(null);
    } catch (error) {
      toast.error("Fehler beim Löschen");
    } finally {
      setDeleting(false);
    }
  };

  const getTaskCount = (project: Project) => {
    return project.tasks?.[0]?.count ?? 0;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projekte</h1>
          <p className="text-sm text-muted-foreground">
            Waehlen Sie ein Projekt, um die Tasks zu verwalten.
          </p>
        </div>
        <Button onClick={() => { setSelectedProject(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Neues Projekt
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setStatusFilter('active')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            statusFilter === 'active'
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Aktive Projekte
        </button>
        <button
          onClick={() => setStatusFilter('archived')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            statusFilter === 'archived'
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Archivierte Projekte
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-32 rounded bg-muted" />
                <div className="h-4 w-48 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-24 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="mb-1 text-lg font-semibold">
            {statusFilter === 'active' ? 'Keine aktiven Projekte' : 'Keine archivierten Projekte'}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {statusFilter === 'active'
              ? 'Erstellen Sie Ihr erstes Projekt, um loszulegen.'
              : 'Archivierte Projekte werden hier angezeigt.'}
          </p>
          {statusFilter === 'active' && (
            <Button onClick={() => { setSelectedProject(null); setDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Erstes Projekt erstellen
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div key={project.id} className="relative group">
              <Link href={`/projects/${project.id}`}>
                <Card className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 flex-shrink-0">
                          <FolderOpen className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-base truncate">{project.name}</CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => handleEdit(project, e)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleArchive(project, e)}>
                            {project.status === 'active' ? (
                              <>
                                <Archive className="mr-2 h-4 w-4" />
                                Archivieren
                              </>
                            ) : (
                              <>
                                <ArchiveRestore className="mr-2 h-4 w-4" />
                                Reaktivieren
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleDelete(project, e)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {project.description && (
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckSquare className="h-3 w-3" />
                        <span>{getTaskCount(project)} Tasks</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Erstellt:{" "}
                          {format(new Date(project.created_at), "dd. MMM yyyy", {
                            locale: de,
                          })}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={selectedProject}
        onSuccess={refetch}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Projekt löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie "{selectedProject?.name}" wirklich löschen?
              Das Projekt kann nur gelöscht werden, wenn es keine Tasks enthält.
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Wird gelöscht..." : "Löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
