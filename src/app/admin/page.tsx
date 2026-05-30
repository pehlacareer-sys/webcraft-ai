'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Key, 
  Activity, 
  Users, 
  FolderOpen,
  Zap,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface APIKeyData {
  id: string;
  provider: string;
  name: string;
  isActive: boolean;
  dailyLimit: number;
  dailyUsed: number;
  lastUsed: string | null;
  requestCount: number;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalProjects: number;
  activeSessions: number;
  totalAPICalls: number;
  providerStats: {
    zai: { total: number; active: number; requests: number };
    openrouter: { total: number; active: number; requests: number };
    groq: { total: number; active: number; requests: number };
  };
}

export default function AdminPage() {
  const [apiKeys, setApiKeys] = useState<APIKeyData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<APIKeyData | null>(null);
  
  // Form state
  const [provider, setProvider] = useState('zai');
  const [keyName, setKeyName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [dailyLimit, setDailyLimit] = useState('100');

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [keysRes, statsRes] = await Promise.all([
        fetch('/api/admin/keys'),
        fetch('/api/admin/stats')
      ]);

      const keysData = await keysRes.json();
      const statsData = await statsRes.json();

      if (keysData.success) setApiKeys(keysData.keys);
      if (statsData.success) setStats(statsData.stats);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Create or update API key
  const handleSaveKey = async () => {
    if (!apiKey.trim()) return;

    try {
      const url = editingKey 
        ? `/api/admin/keys?id=${editingKey.id}`
        : '/api/admin/keys';
      
      const method = editingKey ? 'PUT' : 'POST';
      
      const body = editingKey
        ? { id: editingKey.id, name: keyName, dailyLimit: parseInt(dailyLimit) }
        : { provider, key: apiKey, name: keyName, dailyLimit: parseInt(dailyLimit) };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        fetchData();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save key:', error);
    }
  };

  // Delete API key
  const handleDeleteKey = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/keys?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to delete key:', error);
    }
  };

  // Toggle key active status
  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive })
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to toggle key:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setProvider('zai');
    setKeyName('');
    setApiKey('');
    setDailyLimit('100');
    setEditingKey(null);
  };

  // Open edit dialog
  const openEditDialog = (key: APIKeyData) => {
    setEditingKey(key);
    setKeyName(key.name);
    setDailyLimit(key.dailyLimit.toString());
    setIsDialogOpen(true);
  };

  const getProviderBadge = (provider: string) => {
    const colors = {
      zai: 'bg-violet-100 text-violet-700',
      openrouter: 'bg-blue-100 text-blue-700',
      groq: 'bg-emerald-100 text-emerald-700'
    };
    return colors[provider as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                ← Back to App
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <Users className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
              <FolderOpen className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Sessions</CardTitle>
              <Activity className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeSessions || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">API Calls</CardTitle>
              <Zap className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalAPICalls || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Provider Stats */}
        {stats?.providerStats && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>API Provider Status</CardTitle>
              <CardDescription>Overview of API keys by provider</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                {Object.entries(stats.providerStats).map(([provider, data]) => (
                  <div key={provider} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getProviderBadge(provider)}>
                        {provider.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {data.active}/{data.total} active
                      </span>
                    </div>
                    <div className="text-2xl font-bold">{data.requests}</div>
                    <div className="text-sm text-gray-500">total requests</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Keys Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Manage your API keys for AI providers</CardDescription>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add API Key
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingKey ? 'Edit API Key' : 'Add New API Key'}</DialogTitle>
                    <DialogDescription>
                      {editingKey 
                        ? 'Update the API key settings.'
                        : 'Add a new API key from one of the supported providers.'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {!editingKey && (
                      <div className="space-y-2">
                        <Label htmlFor="provider">Provider</Label>
                        <Select value={provider} onValueChange={setProvider}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="zai">Z.AI</SelectItem>
                            <SelectItem value="openrouter">OpenRouter</SelectItem>
                            <SelectItem value="groq">Groq</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={keyName}
                        onChange={(e) => setKeyName(e.target.value)}
                        placeholder="e.g., Z.AI Account 1"
                      />
                    </div>
                    
                    {!editingKey && (
                      <div className="space-y-2">
                        <Label htmlFor="key">API Key</Label>
                        <Input
                          id="key"
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Enter your API key"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="limit">Daily Limit</Label>
                      <Input
                        id="limit"
                        type="number"
                        value={dailyLimit}
                        onChange={(e) => setDailyLimit(e.target.value)}
                        placeholder="100"
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveKey}>
                      {editingKey ? 'Save Changes' : 'Add Key'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-8">
                <Key className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">No API keys configured</p>
                <p className="text-sm text-gray-400">
                  Add API keys from Z.AI, OpenRouter, or Groq to enable AI generation.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Requests</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>
                        <Badge className={getProviderBadge(key.provider)}>
                          {key.provider.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>
                        <Switch
                          checked={key.isActive}
                          onCheckedChange={(checked) => handleToggleActive(key.id, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <span className={key.dailyUsed >= key.dailyLimit ? 'text-red-600' : ''}>
                          {key.dailyUsed}/{key.dailyLimit}
                        </span>
                      </TableCell>
                      <TableCell>{key.requestCount}</TableCell>
                      <TableCell className="text-gray-500">
                        {key.lastUsed 
                          ? new Date(key.lastUsed).toLocaleDateString()
                          : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(key)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{key.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteKey(key.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Setup Guide */}
        {apiKeys.length === 0 && (
          <Card className="mt-8 border-amber-200 bg-amber-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-amber-800">Get Started</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-amber-700">
              <p className="mb-4">To enable AI website generation, you need to add API keys from one or more providers:</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg border border-amber-200">
                  <h4 className="font-semibold mb-2">Z.AI</h4>
                  <p className="text-sm mb-2">Free tier with GLM-4 models</p>
                  <a 
                    href="https://z.ai/manage-apikey/apikey-list" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-violet-600 hover:underline inline-flex items-center"
                  >
                    Get API Key <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
                <div className="p-4 bg-white rounded-lg border border-amber-200">
                  <h4 className="font-semibold mb-2">OpenRouter</h4>
                  <p className="text-sm mb-2">Access to 50+ free models</p>
                  <a 
                    href="https://openrouter.ai/keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-violet-600 hover:underline inline-flex items-center"
                  >
                    Get API Key <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
                <div className="p-4 bg-white rounded-lg border border-amber-200">
                  <h4 className="font-semibold mb-2">Groq</h4>
                  <p className="text-sm mb-2">Ultra-fast inference</p>
                  <a 
                    href="https://console.groq.com/keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-violet-600 hover:underline inline-flex items-center"
                  >
                    Get API Key <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
