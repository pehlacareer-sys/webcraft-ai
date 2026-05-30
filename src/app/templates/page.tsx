'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Sparkles, 
  Star,
  Users,
  Eye,
  ExternalLink,
  Crown,
  Layout,
  Rocket,
  ShoppingCart,
  PenTool,
  BarChart3,
  Briefcase,
  ArrowRight,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const categories = [
  { value: 'all', label: 'All Templates', icon: Layout },
  { value: 'landing', label: 'Landing Page', icon: Rocket },
  { value: 'portfolio', label: 'Portfolio', icon: Briefcase },
  { value: 'saas', label: 'SaaS', icon: BarChart3 },
  { value: 'blog', label: 'Blog', icon: PenTool },
  { value: 'ecommerce', label: 'E-commerce', icon: ShoppingCart },
  { value: 'dashboard', label: 'Dashboard', icon: BarChart3 }
];

const templates = [
  {
    id: '1',
    name: 'Modern SaaS Landing',
    description: 'A clean, conversion-focused landing page for SaaS products with hero section, features, pricing, and CTA.',
    category: 'landing',
    image: '/templates/saas-landing.png',
    premium: false,
    uses: 1250,
    rating: 4.9,
    tags: ['Hero', 'Pricing', 'CTA'],
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: '2',
    name: 'Developer Portfolio',
    description: 'Minimalist portfolio template for developers with project showcase, skills, and contact form.',
    category: 'portfolio',
    image: '/templates/dev-portfolio.png',
    premium: false,
    uses: 890,
    rating: 4.8,
    tags: ['Projects', 'Skills', 'Contact'],
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: '3',
    name: 'Startup Launch',
    description: 'Bold and modern landing page for startups with animated hero and feature sections.',
    category: 'landing',
    image: '/templates/startup.png',
    premium: false,
    uses: 2100,
    rating: 4.7,
    tags: ['Animated', 'Features', 'Newsletter'],
    gradient: 'from-orange-500 to-amber-500'
  },
  {
    id: '4',
    name: 'Tech Blog',
    description: 'Clean blog template with article grid, categories, and reading time estimates.',
    category: 'blog',
    image: '/templates/blog.png',
    premium: false,
    uses: 650,
    rating: 4.6,
    tags: ['Articles', 'Categories', 'SEO'],
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    id: '5',
    name: 'E-commerce Store',
    description: 'Modern online store template with product grid, filters, and cart preview.',
    category: 'ecommerce',
    image: '/templates/ecommerce.png',
    premium: true,
    uses: 420,
    rating: 4.9,
    tags: ['Products', 'Cart', 'Filters'],
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    id: '6',
    name: 'Analytics Dashboard',
    description: 'Data visualization dashboard with charts, metrics, and responsive design.',
    category: 'dashboard',
    image: '/templates/dashboard.png',
    premium: true,
    uses: 380,
    rating: 4.8,
    tags: ['Charts', 'Metrics', 'Dark Mode'],
    gradient: 'from-indigo-500 to-violet-500'
  },
  {
    id: '7',
    name: 'Agency Portfolio',
    description: 'Professional agency template with case studies, team section, and services.',
    category: 'portfolio',
    image: '/templates/agency.png',
    premium: false,
    uses: 560,
    rating: 4.7,
    tags: ['Case Studies', 'Team', 'Services'],
    gradient: 'from-slate-500 to-gray-600'
  },
  {
    id: '8',
    name: 'SaaS Pricing Page',
    description: 'Conversion-optimized pricing page with tier comparison and FAQ section.',
    category: 'saas',
    image: '/templates/pricing.png',
    premium: false,
    uses: 890,
    rating: 4.8,
    tags: ['Pricing Tiers', 'FAQ', 'Toggle'],
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    id: '9',
    name: 'Product Launch',
    description: 'Specialized landing page for Product Hunt launches with countdown and features.',
    category: 'landing',
    image: '/templates/ph-launch.png',
    premium: true,
    uses: 230,
    rating: 4.9,
    tags: ['Countdown', 'Features', 'Waitlist'],
    gradient: 'from-red-500 to-orange-500'
  }
];

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

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">WebCraft AI</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/templates" className="text-sm font-medium text-violet-600 relative">
                Templates
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-violet-600 rounded-full" />
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Docs
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/10">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-violet-50 to-white overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGM5Ljk0MSAwIDE4LTguMDU5IDE4LTE4cy04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNHMxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNlNWU3ZWIiIGZpbGwtb3BhY2l0eT0iMC40Ii8+PC9nPjwvc3ZnPg==')] opacity-20" />
          
          <div className="relative max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Badge variant="secondary" className="mb-4 px-4 py-1 bg-violet-50 text-violet-700 border-violet-200">
                <Crown className="w-4 h-4 mr-2" />
                50+ Premium Templates
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Start with a Template
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                Choose from professionally designed templates and customize them with AI.
                Save hours of development time with production-ready code.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 mb-8">
                {[
                  { label: 'Templates', value: '50+' },
                  { label: 'Categories', value: '7' },
                  { label: 'Happy Users', value: '10K+' },
                  { label: 'Avg. Rating', value: '4.9' }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="sticky top-16 z-40 bg-white border-b border-gray-100 py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>

              {/* Category Tabs */}
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto overflow-x-auto">
                <TabsList className="bg-gray-100 p-1">
                  {categories.slice(0, 5).map((category) => (
                    <TabsTrigger 
                      key={category.value} 
                      value={category.value}
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      {category.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Category Select for Mobile */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:hidden bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            >
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <Card className="overflow-hidden border border-gray-200 hover:border-violet-200 hover:shadow-xl transition-all duration-300">
                    {/* Preview Image */}
                    <div className={`h-48 bg-gradient-to-br ${template.gradient} relative overflow-hidden`}>
                      {/* Simulated Content */}
                      <div className="absolute inset-4 bg-white/90 rounded-lg shadow-lg p-4">
                        <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
                        <div className="h-2 w-32 bg-gray-100 rounded mb-4" />
                        <div className="space-y-2">
                          <div className="h-2 w-full bg-gray-100 rounded" />
                          <div className="h-2 w-3/4 bg-gray-100 rounded" />
                          <div className="h-2 w-1/2 bg-gray-100 rounded" />
                        </div>
                        <div className="mt-4 flex gap-2">
                          <div className="h-6 w-16 bg-violet-100 rounded" />
                          <div className="h-6 w-16 bg-gray-100 rounded" />
                        </div>
                      </div>
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                        <Button size="sm" variant="outline" className="bg-white border-0 text-gray-900 hover:bg-gray-100">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Link href={`/builder?template=${template.id}`}>
                          <Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg">
                            Use Template
                          </Button>
                        </Link>
                      </div>

                      {/* Premium Badge */}
                      {template.premium && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-amber-500 text-white border-0 shadow-lg">
                            <Crown className="w-3 h-3 mr-1" />
                            Pro
                          </Badge>
                        </div>
                      )}

                      {/* Free Badge */}
                      {!template.premium && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-green-500 text-white border-0 shadow-lg">
                            <Check className="w-3 h-3 mr-1" />
                            Free
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {template.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {template.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <Badge variant="outline" className="capitalize">
                          {template.category}
                        </Badge>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {template.uses.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {template.rating}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Empty State */}
            {filteredTemplates.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
                <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-600 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGM5Ljk0MSAwIDE4LTguMDU5IDE4LTE4cy04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNHMxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9nPjwvc3ZnPg==')] opacity-10" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Can&apos;t find what you&apos;re looking for?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Describe your ideal website and let AI create it from scratch. 
                Get a custom design tailored to your exact needs.
              </p>
              <Link href="/builder">
                <Button size="lg" className="bg-white text-violet-700 hover:bg-gray-100 px-8 shadow-xl">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Custom Website
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8">
            <div className="sm:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">WebCraft AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Build beautiful websites with the power of AI.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/templates" className="hover:text-white transition-colors">Templates</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} WebCraft AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
