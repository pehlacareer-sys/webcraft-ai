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
import { 
  Search, 
  Sparkles, 
  ArrowLeft,
  Star,
  Users,
  Clock,
  Eye,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const categories = ['All', 'Landing Page', 'Portfolio', 'SaaS', 'Blog', 'E-commerce', 'Dashboard'];

const templates = [
  {
    id: '1',
    name: 'Modern SaaS Landing',
    description: 'A clean, conversion-focused landing page for SaaS products with hero section, features, pricing, and CTA.',
    category: 'Landing Page',
    image: '/templates/saas-landing.png',
    premium: false,
    uses: 1250,
    rating: 4.9
  },
  {
    id: '2',
    name: 'Developer Portfolio',
    description: 'Minimalist portfolio template for developers with project showcase, skills, and contact form.',
    category: 'Portfolio',
    image: '/templates/dev-portfolio.png',
    premium: false,
    uses: 890,
    rating: 4.8
  },
  {
    id: '3',
    name: 'Startup Landing',
    description: 'Bold and modern landing page for startups with animated hero and feature sections.',
    category: 'Landing Page',
    image: '/templates/startup.png',
    premium: false,
    uses: 2100,
    rating: 4.7
  },
  {
    id: '4',
    name: 'Blog Platform',
    description: 'Clean blog template with article grid, categories, and reading time estimates.',
    category: 'Blog',
    image: '/templates/blog.png',
    premium: false,
    uses: 650,
    rating: 4.6
  },
  {
    id: '5',
    name: 'E-commerce Store',
    description: 'Modern online store template with product grid, filters, and cart preview.',
    category: 'E-commerce',
    image: '/templates/ecommerce.png',
    premium: true,
    uses: 420,
    rating: 4.9
  },
  {
    id: '6',
    name: 'Analytics Dashboard',
    description: 'Data visualization dashboard with charts, metrics, and responsive design.',
    category: 'Dashboard',
    image: '/templates/dashboard.png',
    premium: true,
    uses: 380,
    rating: 4.8
  },
  {
    id: '7',
    name: 'Agency Portfolio',
    description: 'Professional agency template with case studies, team section, and services.',
    category: 'Portfolio',
    image: '/templates/agency.png',
    premium: false,
    uses: 560,
    rating: 4.7
  },
  {
    id: '8',
    name: 'SaaS Pricing Page',
    description: 'Conversion-optimized pricing page with tier comparison and FAQ section.',
    category: 'SaaS',
    image: '/templates/pricing.png',
    premium: false,
    uses: 890,
    rating: 4.8
  },
  {
    id: '9',
    name: 'Product Hunt Launch',
    description: 'Specialized landing page for Product Hunt launches with countdown and features.',
    category: 'Landing Page',
    image: '/templates/ph-launch.png',
    premium: true,
    uses: 230,
    rating: 4.9
  }
];

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-lg text-gray-900">WebCraft AI</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/templates" className="text-violet-600 font-medium">
                Templates
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900">
                Docs
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-gray-900 hover:bg-gray-800">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Start with a Template
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from professionally designed templates and customize them with AI.
            Save hours of development time.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Templates Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                {/* Preview Image */}
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-24 bg-white rounded-lg shadow-sm" />
                  </div>
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Link href={`/builder?template=${template.id}`}>
                      <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                        Use Template
                      </Button>
                    </Link>
                  </div>

                  {/* Premium Badge */}
                  {template.premium && (
                    <Badge className="absolute top-3 right-3 bg-amber-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {template.uses.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {template.rating}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No templates found matching your criteria.</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-gray-600 mb-6">
            Describe your ideal website and let AI create it from scratch.
          </p>
          <Link href="/builder">
            <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
              Start from Scratch
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8">
            <div className="sm:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-lg">WebCraft AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Build beautiful websites with AI.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/templates" className="hover:text-white">Templates</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
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
