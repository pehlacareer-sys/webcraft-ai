'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
  LayoutDashboard,
  Rocket,
  FileCode,
  TrendingUp,
  Calendar,
  Globe,
  Crown,
  Zap,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  vercelUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const router = useRouter();
  
  const { user, isLoading, isAuthenticated, signOut } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated]);

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
      setIsLoadingProjects(false);
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

  const handleSignOut = async () => {
    await signOut();
  };

  const handleNewProject = () => {
    router.push('/builder');
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileCode },
      generating: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Zap },
      deployed: { bg: 'bg-green-100', text: 'text-green-700', icon: Rocket },
      error: { bg: 'bg-red-100', text: 'text-red-700', icon: FileCode }
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  const deployedCount = projects.filter(p => p.status === 'deployed').length;
  const draftCount = projects.filter(p => p.status === 'draft').length;

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">WebCraft AI</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-emerald-600 relative">
                Dashboard
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-emerald-600 rounded-full" />
              </Link>
              <Link href="/templates" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Templates
              </Link>
              <Link href="/docs" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Docs
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <Button onClick={handleNewProject} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.user_metadata?.full_name || 'User'}</span>
                      <span className="text-xs font-normal text-gray-500">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/pricing">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={handleSignOut}>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-gray-600 mt-1">Manage your projects and create new websites with AI.</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Total Projects</p>
                  <p className="text-3xl font-bold mt-1">{projects.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <FolderOpen className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-white/80">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+2 this week</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Deployed</p>
                  <p className="text-3xl font-bold mt-1 text-gray-900">{deployedCount}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={(deployedCount / Math.max(projects.length, 1)) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-3xl font-bold mt-1 text-gray-900">{draftCount}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Updated today</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">API Calls</p>
                  <p className="text-3xl font-bold mt-1">∞</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-white/80">
                <span>Unlimited free tier</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">Your Projects</CardTitle>
                  <CardDescription>Manage and edit your generated websites</CardDescription>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full sm:w-64 bg-gray-50 border-0 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {isLoadingProjects ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <LayoutDashboard className="w-8 h-8 text-gray-400 animate-pulse" />
                  </div>
                  <p className="text-gray-500">Loading projects...</p>
                </div>
              ) : filteredProjects.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                    <FolderOpen className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery ? 'No projects found' : 'No projects yet'}
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {searchQuery 
                      ? 'Try a different search term or create a new project.'
                      : 'Create your first website with AI. It only takes a few seconds.'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={handleNewProject} size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25">
                      <Plus className="w-5 h-5 mr-2" />
                      Create Your First Project
                    </Button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredProjects.map((project) => {
                    const statusStyle = getStatusBadge(project.status);
                    const StatusIcon = statusStyle.icon;
                    
                    return (
                      <motion.div
                        key={project.id}
                        variants={itemVariants}
                        whileHover={{ y: -4 }}
                        className="group"
                      >
                        <Card className="overflow-hidden border border-gray-200 hover:border-emerald-200 hover:shadow-xl transition-all duration-300">
                          {/* Project Preview */}
                          <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGM5Ljk0MSAwIDE4LTguMDU5IDE4LTE4cy04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNHMxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNlNWU3ZWIiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PC9nPjwvc3ZnPg==')] opacity-50" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <LayoutDashboard className="w-12 h-12 text-gray-300" />
                            </div>
                            <div className="absolute top-3 right-3">
                              <Badge className={`${statusStyle.bg} ${statusStyle.text} border-0 shadow-sm`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {project.status}
                              </Badge>
                            </div>
                            {project.vercelUrl && (
                              <div className="absolute bottom-3 left-3">
                                <Badge className="bg-white/90 text-gray-700 border-0 shadow-sm">
                                  <Globe className="w-3 h-3 mr-1" />
                                  Live
                                </Badge>
                              </div>
                            )}
                          </div>
                          
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                                <CardDescription className="line-clamp-1 mt-1">
                                  {project.description || 'No description provided'}
                                </CardDescription>
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/builder?project=${project.id}`} className="cursor-pointer">
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit Project
                                    </Link>
                                  </DropdownMenuItem>
                                  {project.vercelUrl && (
                                    <DropdownMenuItem asChild>
                                      <a href={project.vercelUrl} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View Live Site
                                      </a>
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600 cursor-pointer"
                                    onClick={() => setDeleteProjectId(project.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Project
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Updated {new Date(project.updatedAt).toLocaleDateString()}
                              </span>
                              <Link 
                                href={`/builder?project=${project.id}`}
                                className="text-emerald-600 hover:text-emerald-700 font-medium"
                              >
                                Open →
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProjectId} onOpenChange={() => setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone and all associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
