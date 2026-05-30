'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Send, 
  Loader2, 
  Code2, 
  Eye, 
  SplitSquareHorizontal,
  Monitor,
  Tablet,
  Smartphone,
  Download,
  Copy,
  Check,
  RefreshCw,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function BuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [viewMode, setViewMode] = useState<'split' | 'code' | 'preview'>('split');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Get initial prompt from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialPrompt = params.get('prompt');
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, []);

  // Generate code
  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          sessionId,
          type: 'website'
        })
      });

      const data = await response.json();

      if (data.success) {
        setCode(data.code);
        setSessionId(data.sessionId);
        setMessages(prev => [...prev, { role: 'assistant', content: data.code }]);
        
        if (data.demo) {
          setMessages(prev => [...prev, { 
            role: 'system', 
            content: 'Demo mode: Add API keys in admin panel for real AI generation.' 
          }]);
        }
      } else {
        setMessages(prev => [...prev, { 
          role: 'system', 
          content: `Error: ${data.error}` 
        }]);
      }
    } catch (error) {
      console.error('Generation error:', error);
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: 'Failed to generate. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };

  // Copy code
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download code
  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get device width
  const getDeviceWidth = () => {
    switch (deviceMode) {
      case 'mobile': return 'w-[375px]';
      case 'tablet': return 'w-[768px]';
      default: return 'w-full';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-6 w-px bg-gray-200" />
          <h1 className="font-semibold text-gray-900">Website Builder</h1>
          {sessionId && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Session Active
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded ${viewMode === 'split' ? 'bg-gray-100' : ''}`}
              title="Split View"
            >
              <SplitSquareHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`p-1.5 rounded ${viewMode === 'code' ? 'bg-gray-100' : ''}`}
              title="Code View"
            >
              <Code2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`p-1.5 rounded ${viewMode === 'preview' ? 'bg-gray-100' : ''}`}
              title="Preview View"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Device Mode Toggle */}
          <div className="hidden sm:flex items-center border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-1.5 rounded ${deviceMode === 'desktop' ? 'bg-gray-100' : ''}`}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`p-1.5 rounded ${deviceMode === 'tablet' ? 'bg-gray-100' : ''}`}
              title="Tablet"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1.5 rounded ${deviceMode === 'mobile' ? 'bg-gray-100' : ''}`}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          {code && (
            <>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Chat */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 400 }}
              exit={{ width: 0 }}
              className="border-r border-gray-200 flex flex-col shrink-0 overflow-hidden"
            >
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <p className="text-sm">Describe the website you want to build</p>
                    <p className="text-xs mt-2 text-gray-400">Press ⌘ + Enter to generate</p>
                  </div>
                )}
                
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-violet-100 ml-4'
                        : msg.role === 'system'
                        ? 'bg-yellow-100 border border-yellow-200'
                        : 'bg-gray-100 mr-4'
                    }`}
                  >
                    <p className="text-sm text-gray-700">
                      {msg.role === 'assistant' 
                        ? 'Website generated successfully!'
                        : msg.content.substring(0, 500)}
                    </p>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">Generating...</span>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe changes or new features..."
                    className="min-h-[60px] resize-none"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">⌘ + Enter to send</span>
                  <Button 
                    size="sm" 
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isLoading}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-r-lg p-1 shadow-sm"
          style={{ left: sidebarOpen ? '400px' : '0' }}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeft className="w-4 h-4" />
          )}
        </button>

        {/* Preview / Code Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Code View */}
          {(viewMode === 'code' || viewMode === 'split') && (
            <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} border-r border-gray-200 overflow-hidden`}>
              <div className="h-full bg-gray-900 overflow-auto">
                <pre className="p-4 text-sm text-gray-100 font-mono whitespace-pre-wrap">
                  {code || '// Your generated code will appear here'}
                </pre>
              </div>
            </div>
          )}

          {/* Preview View */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} bg-gray-100 overflow-auto`}>
              <div className="h-full flex items-start justify-center p-4">
                <div className={`${getDeviceWidth()} bg-white rounded-lg shadow-lg overflow-hidden`}>
                  {code ? (
                    <iframe
                      ref={iframeRef}
                      srcDoc={code}
                      className="w-full h-full min-h-[600px]"
                      title="Preview"
                    />
                  ) : (
                    <div className="h-full min-h-[600px] flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Preview will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
