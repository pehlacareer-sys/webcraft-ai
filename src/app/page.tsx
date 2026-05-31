'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
  Globe,
  Layers,
  Wand2,
  Clock,
  Users,
  Star,
  Play,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const features = [
  {
    icon: Code2,
    title: 'AI-Powered Generation',
    description: 'Generate complete websites from natural language descriptions using advanced AI models.',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    icon: Palette,
    title: 'Figma Import',
    description: 'Import your Figma designs and convert them to production-ready code with 99.99% fidelity.',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    icon: Rocket,
    title: 'One-Click Deploy',
    description: 'Deploy your websites directly to Vercel with a single click. No configuration needed.',
    gradient: 'from-orange-500 to-amber-600'
  },
  {
    icon: Zap,
    title: 'Multi-API Architecture',
    description: 'Powered by multiple AI providers for redundancy and unlimited scalability.',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Shield,
    title: 'Session-Based Locking',
    description: 'Preserves conversation context for better code generation and token efficiency.',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    icon: Globe,
    title: '100% Free to Start',
    description: 'No upfront costs. Start building for free and scale only when you need to.',
    gradient: 'from-cyan-500 to-teal-600'
  }
];

const stats = [
  { label: 'API Providers', value: '3+', icon: Layers },
  { label: 'Concurrent Users', value: '100+', icon: Users },
  { label: 'Free Models', value: '50+', icon: Wand2 },
  { label: 'Design Fidelity', value: '99.99%', icon: Star }
];

const suggestedPrompts = [
  'Create a modern SaaS landing page',
  'Build a portfolio website',
  'Design a pricing page',
  'Create a blog layout'
];

const testimonials = [
  {
    quote: "This tool transformed how I prototype websites. What used to take days now takes minutes.",
    author: "Sarah Chen",
    role: "Frontend Developer",
    avatar: "SC"
  },
  {
    quote: "The Figma import feature is incredible. It's like having a design-to-code superpower.",
    author: "Marcus Johnson",
    role: "Product Designer",
    avatar: "MJ"
  },
  {
    quote: "Finally, an AI website builder that actually understands what I want to build.",
    author: "Emily Rodriguez",
    role: "Startup Founder",
    avatar: "ER"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">WebCraft AI</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/templates" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors relative group">
                Templates
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all" />
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors relative group">
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all" />
              </Link>
              <Link href="/docs" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors relative group">
                Docs
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all" />
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/10">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
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
                <Link href="/templates" className="block text-gray-600 py-2 hover:text-gray-900">
                  Templates
                </Link>
                <Link href="/pricing" className="block text-gray-600 py-2 hover:text-gray-900">
                  Pricing
                </Link>
                <Link href="/docs" className="block text-gray-600 py-2 hover:text-gray-900">
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
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-white to-white" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGM5Ljk0MSAwIDE4LTguMDU5IDE4LTE4cy04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNHMxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNlNWU3ZWIiIGZpbGwtb3BhY2l0eT0iMC40Ii8+PC9nPjwvc3ZnPg==')] opacity-20" />
          
          {/* Floating Elements */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000" />

          <div className="relative w-full max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200 shadow-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Website Builder
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                Build websites with
                <span className="block mt-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                  natural language
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Describe what you want, and watch AI generate a complete, production-ready website in seconds. No coding required.
              </p>
            </motion.div>

            {/* Chat Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200 overflow-hidden">
                {/* Header Bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-gray-400 ml-2">WebCraft AI</span>
                </div>
                
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4">
                    {/* Prompt Input */}
                    <div className="relative">
                      <Textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe the website you want to build..."
                        className="w-full min-h-[100px] sm:min-h-[120px] resize-none border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder:text-gray-400 text-base sm:text-lg p-4 rounded-xl transition-all"
                        rows={3}
                      />
                      <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-gray-400">
                        <kbd className="hidden sm:inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-500 font-mono">
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
                          className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700 transition-all duration-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>

                    {/* Generate Button */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Free to start
                        </span>
                        <span className="hidden sm:flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          No credit card
                        </span>
                      </div>
                      <Button
                        onClick={handleSubmit}
                        disabled={!prompt.trim() || isLoading}
                        size="lg"
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 sm:px-8 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
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
              </div>

              {/* Decorative Elements */}
              <div className="absolute -z-10 -top-6 -left-6 w-32 h-32 bg-emerald-200 rounded-full blur-3xl opacity-40" />
              <div className="absolute -z-10 -bottom-6 -right-6 w-40 h-40 bg-teal-200 rounded-full blur-3xl opacity-40" />
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  className="text-center p-4 rounded-xl bg-white/80 backdrop-blur border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300"
                >
                  <stat.icon className="w-5 h-5 mx-auto mb-2 text-emerald-600" />
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge variant="secondary" className="mb-4 px-4 py-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                Features
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Everything you need to build
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Powerful features that help you create, customize, and deploy websites faster than ever.
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge variant="secondary" className="mb-4 px-4 py-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                Testimonials
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Loved by developers
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                See what others are saying about WebCraft AI.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-2xl p-6 relative"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.author}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                  <div className="flex gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-600 to-teal-700 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGM5Ljk0MSAwIDE4LTguMDU5IDE4LTE4cy04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNHMxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9nPjwvc3ZnPg==')] opacity-10" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to build your first website?
              </h2>
              <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of developers and designers building with AI. Start for free today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-emerald-700 hover:bg-gray-100 px-8 shadow-xl">
                    Get Started for Free
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/templates">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                    View Templates
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">WebCraft AI</span>
              </div>
              <p className="text-gray-400 text-sm mb-6 max-w-sm">
                Build beautiful websites with the power of AI. Free to start, scalable for growth.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4 text-gray-100">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/templates" className="hover:text-white transition-colors">Templates</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-100">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-100">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-400">
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
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Built with AI
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

