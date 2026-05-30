'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Loader2, 
  Sparkles,
  Code2,
  Palette,
  Rocket,
  Github,
  Twitter,
  Linkedin,
  Menu,
  X,
  ChevronRight,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const features = [
  {
    icon: Code2,
    title: 'AI-Powered Generation',
    description: 'Generate complete websites from natural language descriptions using advanced AI models.'
  },
  {
    icon: Palette,
    title: 'Figma Import',
    description: 'Import your Figma designs and convert them to production-ready code with 99.99% fidelity.'
  },
  {
    icon: Rocket,
    title: 'One-Click Deploy',
    description: 'Deploy your websites directly to Vercel with a single click. No configuration needed.'
  },
  {
    icon: Zap,
    title: 'Multi-API Architecture',
    description: 'Powered by multiple AI providers for redundancy and unlimited scalability.'
  },
  {
    icon: Shield,
    title: 'Session-Based Locking',
    description: 'Preserves conversation context for better code generation and token efficiency.'
  },
  {
    icon: Globe,
    title: '100% Free to Start',
    description: 'No upfront costs. Start building for free and scale only when you need to.'
  }
];

const stats = [
  { label: 'API Providers', value: '3+' },
  { label: 'Concurrent Users', value: '100+' },
  { label: 'Free Models', value: '50+' },
  { label: 'Design Fidelity', value: '99.99%' }
];

const suggestedPrompts = [
  'Create a modern SaaS landing page',
  'Build a portfolio website',
  'Design a pricing page',
  'Create a blog layout'
];

export default function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;
    
    setIsLoading(true);
    // Redirect to builder with prompt
    window.location.href = `/builder?prompt=${encodeURIComponent(prompt)}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg text-gray-900">WebCraft AI</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/templates" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Templates
              </Link>
              <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Docs
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
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

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-100"
            >
              <div className="px-4 py-4 space-y-3">
                <Link href="/templates" className="block text-gray-600 py-2">
                  Templates
                </Link>
                <Link href="/pricing" className="block text-gray-600 py-2">
                  Pricing
                </Link>
                <Link href="/docs" className="block text-gray-600 py-2">
                  Docs
                </Link>
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <Link href="/login" className="block">
                    <Button variant="ghost" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/signup" className="block">
                    <Button className="w-full bg-gray-900 hover:bg-gray-800">Get Started</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {/* Hero Section - Chat Box */}
        <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-50 via-white to-white" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGM5Ljk0MSAwIDE4LTguMDU5IDE4LTE4cy04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNHMxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNlNWU3ZWIiIGZpbGwtb3BhY2l0eT0iMC40Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />

          <div className="relative w-full max-w-4xl mx-auto">
            {/* Title */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium bg-violet-50 text-violet-700 border-violet-200">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI-Powered Website Builder
                </Badge>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-4"
              >
                Build websites with
                <span className="block mt-1 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  natural language
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-gray-600 max-w-2xl mx-auto"
              >
                Describe what you want, and watch AI generate a complete, production-ready website in seconds.
              </motion.p>
            </div>

            {/* Chat Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col gap-4">
                  {/* Prompt Input */}
                  <div className="relative">
                    <Textarea
                      ref={textareaRef}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Describe the website you want to build..."
                      className="w-full min-h-[100px] sm:min-h-[120px] resize-none border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-violet-500 text-gray-900 placeholder:text-gray-400 text-base sm:text-lg p-4 rounded-xl"
                      rows={3}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-gray-400">
                      <kbd className="hidden sm:inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-500">
                        ⌘ + Enter
                      </kbd>
                    </div>
                  </div>

                  {/* Suggested Prompts */}
                  <div className="flex flex-wrap gap-2">
                    {suggestedPrompts.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setPrompt(suggestion)}
                        className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

                  {/* Generate Button */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Free to start • No credit card required
                    </p>
                    <Button
                      onClick={handleSubmit}
                      disabled={!prompt.trim() || isLoading}
                      size="lg"
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 sm:px-8"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          Generate Website
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -z-10 -top-4 -left-4 w-24 h-24 bg-violet-200 rounded-full blur-3xl opacity-50" />
              <div className="absolute -z-10 -bottom-4 -right-4 w-32 h-32 bg-indigo-200 rounded-full blur-3xl opacity-50" />
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 rounded-xl bg-gray-50/50">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Everything you need to build
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Powerful features that help you create, customize, and deploy websites faster than ever.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-violet-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ready to build your first website?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of developers and designers building with AI.
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-8">
                Get Started for Free
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-lg">WebCraft AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Build beautiful websites with the power of AI. Free to start, scalable for growth.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/templates" className="hover:text-white transition-colors">Templates</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} WebCraft AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
