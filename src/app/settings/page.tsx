'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  CreditCard, 
  Globe, 
  Palette,
  Key,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Check,
  Sparkles,
  Crown,
  Zap,
  ExternalLink,
  Trash2,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">WebCraft AI</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <Link href="/templates" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Templates
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences.</p>
        </motion.div>

        <Tabs defaultValue="profile" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <TabsList className="bg-white border border-gray-200 p-1 rounded-xl">
              <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="account" className="rounded-lg data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
                <SettingsIcon className="w-4 h-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="billing" className="rounded-lg data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
                <CreditCard className="w-4 h-4 mr-2" />
                Billing
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Profile Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your profile details and avatar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=john" />
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">JD</AvatarFallback>
                      </Avatar>
                      <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:bg-emerald-700 transition-colors">
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">John Doe</h3>
                      <p className="text-sm text-gray-500">john@example.com</p>
                      <Badge variant="secondary" className="mt-2 bg-emerald-100 text-emerald-700">
                        <Crown className="w-3 h-3 mr-1" />
                        Pro Plan
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Form Fields */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="John" className="bg-gray-50 border-gray-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Doe" className="bg-gray-50 border-gray-200" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" defaultValue="john@example.com" className="bg-gray-50 border-gray-200" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input id="bio" placeholder="Tell us about yourself..." className="bg-gray-50 border-gray-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" placeholder="https://yourwebsite.com" className="bg-gray-50 border-gray-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input id="company" placeholder="Your company" className="bg-gray-50 border-gray-200" />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline">Cancel</Button>
                    <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                      <Check className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Account Preferences</CardTitle>
                  <CardDescription>Manage your account settings and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Language & Theme */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        Language
                      </Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="bg-gray-50 border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                          <SelectItem value="zh">中文</SelectItem>
                          <SelectItem value="ja">日本語</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-gray-500" />
                        Theme
                      </Label>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger className="bg-gray-50 border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Connected Accounts */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Connected Accounts</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Google</p>
                            <p className="text-sm text-gray-500">john@gmail.com</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-0">Connected</Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">GitHub</p>
                            <p className="text-sm text-gray-500">Not connected</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Connect</Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Danger Zone */}
                  <div>
                    <h3 className="font-semibold text-red-600 mb-4">Danger Zone</h3>
                    <div className="p-4 border border-red-200 rounded-xl bg-red-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Delete Account</p>
                          <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                        </div>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive email updates about your projects</p>
                        </div>
                      </div>
                      <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Smartphone className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Push Notifications</p>
                          <p className="text-sm text-gray-500">Get push notifications on your device</p>
                        </div>
                      </div>
                      <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Generation Complete</p>
                          <p className="text-sm text-gray-500">Get notified when AI generation finishes</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                          <Bell className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Weekly Digest</p>
                          <p className="text-sm text-gray-500">Receive a weekly summary of your activity</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your password and security options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Change Password */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Change Password
                    </h3>
                    <div className="space-y-4 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input 
                            id="currentPassword" 
                            type={showPassword ? "text" : "password"} 
                            className="bg-gray-50 border-gray-200 pr-10"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" className="bg-gray-50 border-gray-200" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" className="bg-gray-50 border-gray-200" />
                      </div>
                      <Button className="bg-gradient-to-r from-emerald-600 to-teal-600">
                        <Lock className="w-4 h-4 mr-2" />
                        Update Password
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Two-Factor Authentication */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                      </div>
                      <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                    </div>
                  </div>

                  <Separator />

                  {/* Sessions */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Current Session</p>
                            <p className="text-sm text-gray-500">Chrome on macOS • Active now</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-0">Current</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Current Plan */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm">Current Plan</p>
                      <h2 className="text-2xl font-bold">Pro Plan</h2>
                      <p className="text-white/80 mt-1">$19/month • Renews on Jan 15, 2026</p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                        Change Plan
                      </Button>
                      <Button className="bg-white text-emerald-700 hover:bg-gray-100">
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Manage your payment methods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">VISA</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                        <p className="text-sm text-gray-500">Expires 12/2026</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Billing History */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>View your past invoices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { date: 'Dec 15, 2025', amount: '$19.00', status: 'Paid' },
                      { date: 'Nov 15, 2025', amount: '$19.00', status: 'Paid' },
                      { date: 'Oct 15, 2025', amount: '$19.00', status: 'Paid' },
                    ].map((invoice, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{invoice.date}</p>
                            <p className="text-sm text-gray-500">Pro Plan - Monthly</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className="bg-green-100 text-green-700 border-0">{invoice.status}</Badge>
                          <span className="font-medium text-gray-900">{invoice.amount}</span>
                          <Button variant="ghost" size="sm" className="text-emerald-600">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
