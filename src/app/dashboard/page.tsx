'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Trash2, 
  Edit, 
  ExternalLink,
  FolderOpen,
  Clock,
  Sparkles,
  Settings,
  LogOut,
  User,
  LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  vercelUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteProjectId) return;

    try {
      const response = await fetch(`/api/projects?id=${deleteProjectId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== deleteProjectId));
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setDeleteProjectId(null);
    }
  };

  const handleNewProject = () => {
    router.push('/builder');
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      generating: 'bg-yellow-100 text-yellow-700',
      deployed: 'bg-green-100 text-green-700',
      error: 'bg-red-100 text-red-700'
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg text-gray-900">WebCraft AI</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-violet-600 font-medium">
                Dashboard
              </Link>
              <Link href="/templates" className="text-gray-600 hover:text-gray-900">
                Templates
              </Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900">
                Docs
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <Button onClick={handleNewProject} className="bg-violet-600 hover:bg-violet-700">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-violet-600" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600">Manage your projects and create new websites.</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{projects.length}</p>
                  <p className="text-sm text-gray-600">Total Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <ExternalLink className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {projects.filter(p => p.status === 'deployed').length}
                  </p>
                  <p className="text-sm text-gray-600">Deployed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {projects.filter(p => p.status === 'draft').length}
                  </p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>Manage and edit your generated websites</CardDescription>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">
                Loading projects...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'No projects found' : 'No projects yet'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery 
                    ? 'Try a different search term'
                    : 'Create your first website with AI'}
                </p>
                {!searchQuery && (
                  <Button onClick={handleNewProject} className="bg-violet-600 hover:bg-violet-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    {/* Project Preview */}
                    <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <LayoutDashboard className="w-8 h-8 text-gray-400" />
                      </div>
                      <Badge 
                        className={`absolute top-2 right-2 ${getStatusBadge(project.status)}`}
                      >
                        {project.status}
                      </Badge>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <CardDescription className="line-clamp-1">
                            {project.description || 'No description'}
                          </CardDescription>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/builder?project=${project.id}`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            {project.vercelUrl && (
                              <DropdownMenuItem asChild>
                                <a href={project.vercelUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View Live
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => setDeleteProjectId(project.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-xs text-gray-500">
                        Updated {new Date(project.updatedAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProjectId} onOpenChange={() => setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
