'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Sparkles, 
  Book,
  Code2,
  Zap,
  Rocket,
  Settings,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Terminal,
  FileCode,
  Globe,
  Key,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const guides = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of WebCraft AI',
    icon: Rocket,
    href: '#getting-started',
    items: [
      { title: 'Quick Start Guide', href: '#quick-start' },
      { title: 'Creating Your First Project', href: '#first-project' },
      { title: 'Understanding the Interface', href: '#interface' },
    ]
  },
  {
    title: 'AI Generation',
    description: 'Master AI-powered code generation',
    icon: Zap,
    href: '#ai-generation',
    items: [
      { title: 'Writing Effective Prompts', href: '#prompts' },
      { title: 'Iterative Development', href: '#iterative' },
      { title: 'Best Practices', href: '#best-practices' },
    ]
  },
  {
    title: 'Templates',
    description: 'Use and customize templates',
    icon: Layers,
    href: '#templates',
    items: [
      { title: 'Browsing Templates', href: '#browse-templates' },
      { title: 'Customizing Templates', href: '#customize' },
      { title: 'Creating Custom Templates', href: '#custom-templates' },
    ]
  },
  {
    title: 'Deployment',
    description: 'Deploy your projects to the web',
    icon: Globe,
    href: '#deployment',
    items: [
      { title: 'Deploying to Vercel', href: '#vercel' },
      { title: 'Custom Domains', href: '#domains' },
      { title: 'Environment Variables', href: '#env-vars' },
    ]
  },
  {
    title: 'API Reference',
    description: 'Integrate with our API',
    icon: Code2,
    href: '#api',
    items: [
      { title: 'Authentication', href: '#auth' },
      { title: 'Endpoints', href: '#endpoints' },
      { title: 'Rate Limits', href: '#rate-limits' },
    ]
  },
  {
    title: 'API Keys',
    description: 'Configure your AI providers',
    icon: Key,
    href: '#api-keys',
    items: [
      { title: 'Adding API Keys', href: '#add-keys' },
      { title: 'Multi-Provider Setup', href: '#multi-provider' },
      { title: 'Security Best Practices', href: '#security' },
    ]
  }
];

const codeExamples = [
  {
    title: 'Generate a Website',
    language: 'bash',
    code: `curl -X POST https://api.webcraft.ai/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Create a modern landing page for a SaaS product",
    "type": "website"
  }'`
  },
  {
    title: 'Continue Session',
    language: 'bash',
    code: `curl -X POST https://api.webcraft.ai/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Add a pricing section with three tiers",
    "sessionId": "previous-session-id"
  }'`
  },
  {
    title: 'List Projects',
    language: 'bash',
    code: `curl https://api.webcraft.ai/projects \\
  -H "Authorization: Bearer YOUR_API_KEY"`
  }
];

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

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
              <Link href="/templates" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Templates
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="text-sm font-medium text-violet-600 relative">
                Docs
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-violet-600 rounded-full" />
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
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-violet-50 to-white">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Badge variant="secondary" className="mb-4 px-4 py-1 bg-violet-50 text-violet-700 border-violet-200">
                <Book className="w-4 h-4 mr-2" />
                Documentation
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Build faster with WebCraft AI
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                Everything you need to know to build amazing websites with AI. 
                From getting started to advanced API integration.
              </p>

              {/* Search */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base bg-white border-gray-200 shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((guide, index) => (
                <motion.div
                  key={guide.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full border border-gray-200 hover:border-violet-200 hover:shadow-lg transition-all duration-300 group">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <guide.icon className="w-6 h-6 text-violet-600" />
                      </div>
                      <CardTitle className="text-lg">{guide.title}</CardTitle>
                      <CardDescription>{guide.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {guide.items.map((item, i) => (
                          <li key={i}>
                            <a 
                              href={item.href}
                              className="flex items-center text-sm text-gray-600 hover:text-violet-600 transition-colors"
                            >
                              <ChevronRight className="w-4 h-4 mr-1" />
                              {item.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Getting Started Section */}
        <section id="getting-started" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="secondary" className="mb-4 px-4 py-1">Getting Started</Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Quick Start Guide</h2>
              
              <div className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold">1</div>
                      <CardTitle>Create an Account</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Sign up for a free account at <Link href="/signup" className="text-violet-600 hover:underline">webcraft.ai/signup</Link>. 
                      You&apos;ll get access to 5 free projects and basic AI generation.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold">2</div>
                      <CardTitle>Configure API Keys (Optional)</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      For advanced AI generation, add your API keys from supported providers. 
                      Go to the Admin Panel to configure your keys.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-violet-100 text-violet-700">Z.AI</Badge>
                      <Badge className="bg-blue-100 text-blue-700">OpenRouter</Badge>
                      <Badge className="bg-green-100 text-green-700">Groq</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold">3</div>
                      <CardTitle>Generate Your First Website</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Navigate to the builder and describe the website you want to create. 
                      Be specific about features, style, and functionality.
                    </p>
                    <div className="p-4 bg-gray-100 rounded-xl">
                      <p className="text-sm text-gray-500 mb-2">Example prompt:</p>
                      <p className="text-gray-700 italic">
                        &quot;Create a modern SaaS landing page with a hero section, features grid, 
                        pricing table with 3 tiers, and a contact form.&quot;
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </section>

        {/* API Reference Section */}
        <section id="api" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="secondary" className="mb-4 px-4 py-1">API Reference</Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">API Examples</h2>
              
              <div className="space-y-6">
                {codeExamples.map((example, index) => (
                  <Card key={index} className="border-0 shadow-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-900 text-white">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4" />
                        <span className="text-sm font-medium">{example.title}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(example.code, index)}
                        className="text-gray-400 hover:text-white h-8"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <div className="bg-gray-950 p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                        {example.code}
                      </pre>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-600 to-indigo-700">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center text-white"
            >
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h2 className="text-3xl font-bold mb-4">Tips for Better Results</h2>
              <div className="grid sm:grid-cols-2 gap-6 text-left mt-8">
                {[
                  { title: 'Be Specific', description: 'Include details about colors, layout, features, and functionality you want.' },
                  { title: 'Iterate', description: 'Use the chat to refine and improve your website incrementally.' },
                  { title: 'Use Examples', description: 'Reference existing websites or designs for style inspiration.' },
                  { title: 'Break It Down', description: 'For complex sites, describe sections separately for better results.' },
                ].map((tip, index) => (
                  <div key={index} className="p-4 bg-white/10 rounded-xl backdrop-blur">
                    <h3 className="font-semibold mb-1">{tip.title}</h3>
                    <p className="text-sm text-white/80">{tip.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Help Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Need More Help?</h2>
            <p className="text-gray-600 mb-8">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                  Contact Support
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="https://github.com" target="_blank">
                <Button size="lg" variant="outline">
                  <FileCode className="w-4 h-4 mr-2" />
                  View on GitHub
                </Button>
              </Link>
            </div>
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
