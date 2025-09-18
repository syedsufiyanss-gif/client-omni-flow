import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Calendar, Users, BarChart3, Clock, CheckCircle, AlertCircle, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  start_date?: string;
  due_date?: string;
  progress_percent: number;
  budget?: number;
  spent_amount: number;
  currency: string;
  owner?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  tasks_count?: number;
  completed_tasks?: number;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled' | 'completed';
  priority: string;
  due_date?: string;
  assignee?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  estimated_hours?: number;
  actual_hours: number;
}

const PROJECT_STATUS_COLORS = {
  active: 'default',
  completed: 'default',
  on_hold: 'secondary',
  cancelled: 'destructive'
} as const;

const TASK_STATUS_ICONS = {
  todo: Circle,
  in_progress: Clock,
  review: AlertCircle,
  done: CheckCircle,
  cancelled: Circle
} as const;

export function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const { profile } = useAuthContext();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadTasks(selectedProject.id);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!projects_owner_id_fkey (id, first_name, last_name)
        `)
        .eq('company_id', profile?.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProjects = data?.map(project => ({
        ...project,
        owner: project.profiles,
        tasks_count: 0, // Will be updated when tasks are loaded
        completed_tasks: 0
      })) || [];

      setProjects(formattedProjects);
      if (formattedProjects.length > 0 && !selectedProject) {
        setSelectedProject(formattedProjects[0]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          profiles!tasks_assignee_id_fkey (id, first_name, last_name)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTasks = data?.map(task => ({
        ...task,
        assignee: task.profiles
      })) || [];

      setTasks(formattedTasks);

      // Update project with task counts
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? {
              ...project,
              tasks_count: formattedTasks.length,
              completed_tasks: formattedTasks.filter(t => t.status === 'done').length
            }
          : project
      ));
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const ProjectCard = ({ project, isSelected }: { project: Project; isSelected: boolean }) => {
    const isOverdue = project.due_date && new Date(project.due_date) < new Date();
    
    return (
      <Card 
        className={`cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'
        }`}
        onClick={() => setSelectedProject(project)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base mb-1 truncate">{project.name}</CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {project.description || 'No description'}
              </CardDescription>
            </div>
            <Badge variant={PROJECT_STATUS_COLORS[project.status as keyof typeof PROJECT_STATUS_COLORS]}>
              {project.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{project.progress_percent}%</span>
              </div>
              <Progress value={project.progress_percent} className="h-2" />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1">
                <BarChart3 className="w-4 h-4" />
                <span>{project.tasks_count || 0} tasks</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>{project.completed_tasks || 0}</span>
              </div>
            </div>

            {project.budget && (
              <div className="text-sm">
                <div className="flex items-center justify-between">
                  <span>Budget</span>
                  <span className="font-medium">
                    {formatCurrency(project.budget, project.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Spent</span>
                  <span>
                    {formatCurrency(project.spent_amount, project.currency)}
                  </span>
                </div>
              </div>
            )}

            {project.due_date && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="w-3 h-3 mr-1" />
                <span className={isOverdue ? "text-destructive font-medium" : ""}>
                  Due {new Date(project.due_date).toLocaleDateString()}
                </span>
              </div>
            )}

            {project.owner && (
              <div className="flex items-center space-x-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">
                    {project.owner.first_name?.[0]}{project.owner.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {project.owner.first_name} {project.owner.last_name}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const TaskItem = ({ task }: { task: Task }) => {
    const StatusIcon = TASK_STATUS_ICONS[task.status];
    const isOverdue = task.due_date && new Date(task.due_date) < new Date();

    return (
      <div className="flex items-start space-x-3 p-3 border rounded-lg bg-background">
        <StatusIcon className={`w-5 h-5 mt-0.5 ${
          task.status === 'done' ? 'text-green-600' : 'text-muted-foreground'
        }`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className={`font-medium text-sm ${
                task.status === 'done' ? 'line-through text-muted-foreground' : ''
              }`}>
                {task.title}
              </h4>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {task.priority}
            </Badge>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              {task.due_date && (
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span className={isOverdue ? "text-destructive" : ""}>
                    {new Date(task.due_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              {task.estimated_hours && (
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{task.estimated_hours}h est.</span>
                </div>
              )}
            </div>
            
            {task.assignee && (
              <div className="flex items-center space-x-1">
                <Avatar className="w-5 h-5">
                  <AvatarFallback className="text-xs">
                    {task.assignee.first_name?.[0]}{task.assignee.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="p-8 text-center">Loading projects...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Project Management</h1>
          <p className="text-muted-foreground">
            Manage your projects, tasks, and team collaboration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Team
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Projects</CardTitle>
              <CardDescription>
                {projects.length} active projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {projects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  isSelected={selectedProject?.id === project.id}
                />
              ))}
              {projects.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No projects found
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Project Details */}
        <div className="lg:col-span-2">
          {selectedProject ? (
            <Tabs value={activeView} onValueChange={setActiveView}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedProject.name}</CardTitle>
                    <CardDescription>{selectedProject.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Progress</p>
                        <Progress value={selectedProject.progress_percent} className="h-3" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedProject.progress_percent}% complete
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Tasks</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {selectedProject.completed_tasks} / {selectedProject.tasks_count} completed
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {selectedProject.budget && (
                      <div>
                        <p className="text-sm font-medium mb-2">Budget Overview</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Budget</p>
                            <p className="font-medium">
                              {formatCurrency(selectedProject.budget, selectedProject.currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Spent</p>
                            <p className="font-medium">
                              {formatCurrency(selectedProject.spent_amount, selectedProject.currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Remaining</p>
                            <p className="font-medium text-green-600">
                              {formatCurrency(
                                selectedProject.budget - selectedProject.spent_amount, 
                                selectedProject.currency
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-lg">Tasks</CardTitle>
                      <CardDescription>
                        Manage project tasks and assignments
                      </CardDescription>
                    </div>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tasks.map(task => (
                        <TaskItem key={task.id} task={task} />
                      ))}
                      {tasks.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No tasks found for this project
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Timeline</CardTitle>
                    <CardDescription>Gantt chart and milestones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      Timeline view coming soon
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="files">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Files</CardTitle>
                    <CardDescription>Documents and attachments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      File management coming soon
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">Select a project to view details</p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}