'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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
  PanelLeftClose,
  PanelLeft,
  Save,
  FileCode,
  File,
  Folder,
  MessageSquare,
  Wand2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  Lightbulb,
  Hammer,
  Zap,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'plan' | 'code';
}

interface PlanSection {
  title: string;
  content: string;
}

export default function BuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [plan, setPlan] = useState<PlanSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentProvider, setCurrentProvider] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [viewMode, setViewMode] = useState<'split' | 'code' | 'preview'>('split');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSaved, setIsSaved] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [planMode, setPlanMode] = useState(true);
  const [streamingText, setStreamingText] = useState('');
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get initial prompt from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialPrompt = params.get('prompt');
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // Parse plan from text
  const parsePlan = (text: string): PlanSection[] => {
    const sections: PlanSection[] = [];
    const lines = text.split('\n');
    let currentSection = '';
    let currentContent = '';
    
    for (const line of lines) {
      if (line.startsWith('## ') || line.startsWith('### ')) {
        if (currentSection) {
          sections.push({ title: currentSection, content: currentContent.trim() });
        }
        currentSection = line.replace(/^##+ /, '');
        currentContent = '';
      } else {
        currentContent += line + '\n';
      }
    }
    
    if (currentSection) {
      sections.push({ title: currentSection, content: currentContent.trim() });
    }
    
    return sections.length > 0 ? sections : [{ title: 'Plan', content: text }];
  };

  // Generate with streaming
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setProgress(0);
    setStreamingText('');
    setIsSaved(false);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/generate-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          sessionId,
          mode: planMode ? 'plan' : 'develop',
          existingCode: code
        })
      });

      if (!response.ok) {
        throw new Error('Failed to connect to generation service');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedCode = '';
      let accumulatedPlan = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                switch (data.type) {
                  case 'progress':
                    setProgress(data.progress);
                    break;
                  case 'provider':
                    setCurrentProvider(data.provider);
                    break;
                  case 'plan':
                    accumulatedPlan += data.chunk || '';
                    setStreamingText(accumulatedPlan);
                    break;
                  case 'code':
                    accumulatedCode += data.chunk || '';
                    setStreamingText(accumulatedCode);
                    break;
                  case 'done':
                    if (data.mode === 'plan') {
                      const parsedPlan = parsePlan(data.plan || accumulatedPlan);
                      setPlan(parsedPlan);
                      
                      const planMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: data.plan || accumulatedPlan,
                        timestamp: new Date(),
                        type: 'plan'
                      };
                      setMessages(prev => [...prev, planMessage]);
                    } else {
                      setCode(data.code || accumulatedCode);
                      
                      const codeMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: 'I\'ve generated your website code. Check the preview on the right!',
                        timestamp: new Date(),
                        type: 'code'
                      };
                      setMessages(prev => [...prev, codeMessage]);
                    }
                    setSessionId(data.sessionId);
                    break;
                  case 'error':
                    const errorMessage: Message = {
                      id: (Date.now() + 1).toString(),
                      role: 'system',
                      content: `Error: ${data.error}`,
                      timestamp: new Date()
                    };
                    setMessages(prev => [...prev, errorMessage]);
                    break;
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

    } catch (error) {
      console.error('Generation error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: 'Failed to generate. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setProgress(0);
      setStreamingText('');
      setPrompt('');
    }
  }, [prompt, isLoading, sessionId, planMode, code]);

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

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-gray-950">
        {/* Header */}
        <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Back</span>
            </Link>
            <div className="h-6 w-px bg-gray-700" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-medium text-white">Untitled Project</h1>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {isSaved ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Saved
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Unsaved
                    </span>
                  )}
                </div>
              </div>
            </div>
            {sessionId && (
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-1.5 animate-pulse" />
                Session Active
              </Badge>
            )}
            {currentProvider && isLoading && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                <Zap className="w-3 h-3 mr-1" />
                {currentProvider}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Plan Mode Toggle */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
              <Label htmlFor="plan-mode" className="text-xs text-gray-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                Plan
              </Label>
              <Switch
                id="plan-mode"
                checked={planMode}
                onCheckedChange={setPlanMode}
                className="data-[state=checked]:bg-emerald-600"
              />
              <Label className="text-xs text-gray-400 flex items-center gap-1.5">
                <Hammer className="w-3.5 h-3.5" />
                Build
              </Label>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-gray-800 rounded-lg p-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('split')}
                className={`h-7 px-2 ${viewMode === 'split' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <SplitSquareHorizontal className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('code')}
                className={`h-7 px-2 ${viewMode === 'code' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Code2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('preview')}
                className={`h-7 px-2 ${viewMode === 'preview' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>

            {/* Device Mode Toggle */}
            <div className="hidden sm:flex items-center bg-gray-800 rounded-lg p-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeviceMode('desktop')}
                className={`h-7 px-2 ${deviceMode === 'desktop' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeviceMode('tablet')}
                className={`h-7 px-2 ${deviceMode === 'tablet' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeviceMode('mobile')}
                className={`h-7 px-2 ${deviceMode === 'mobile' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>

            <div className="h-6 w-px bg-gray-700 hidden sm:block" />

            {/* Actions */}
            {code && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy Code</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={handleDownload} className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download</TooltipContent>
                </Tooltip>
              </>
            )}
            
            <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Sidebar - Chat */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 400, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="bg-gray-900 border-r border-gray-800 flex flex-col shrink-0 overflow-hidden"
              >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  {/* Sidebar Header */}
                  <div className="p-4 border-b border-gray-800">
                    <TabsList className="bg-gray-800 w-full">
                      <TabsTrigger value="chat" className="flex-1 gap-1.5 data-[state=active]:bg-gray-700">
                        <MessageSquare className="w-4 h-4" />
                        Chat
                      </TabsTrigger>
                      <TabsTrigger value="plan" className="flex-1 gap-1.5 data-[state=active]:bg-gray-700">
                        <FileText className="w-4 h-4" />
                        Plan
                      </TabsTrigger>
                      <TabsTrigger value="files" className="flex-1 gap-1.5 data-[state=active]:bg-gray-700">
                        <File className="w-4 h-4" />
                        Files
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Chat Content */}
                  <TabsContent value="chat" className="flex-1 flex flex-col m-0 overflow-hidden data-[state=inactive]:hidden">
                    {/* Chat Messages */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.length === 0 && (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                              <Wand2 className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="text-white font-medium mb-2">
                              {planMode ? 'Plan Your Website' : 'Start Building'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {planMode 
                                ? 'Describe your website and I\'ll create a detailed plan'
                                : 'Describe the website you want to build'}
                            </p>
                            <p className="text-xs text-gray-600 mt-2">Press ⌘ + Enter to generate</p>
                          </div>
                        )}
                        
                        {messages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3 rounded-xl ${
                              msg.role === 'user'
                                ? 'bg-emerald-500/20 ml-4 border border-emerald-500/30'
                                : msg.role === 'system'
                                ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-200'
                                : msg.type === 'plan'
                                ? 'bg-blue-500/10 mr-4 border border-blue-500/30'
                                : 'bg-gray-800 mr-4 border border-gray-700'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {msg.role === 'user' ? (
                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                                  <span className="text-xs text-white">U</span>
                                </div>
                              ) : msg.role === 'system' ? (
                                <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center shrink-0 mt-0.5">
                                  <AlertCircle className="w-3 h-3 text-white" />
                                </div>
                              ) : msg.type === 'plan' ? (
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                                  <Lightbulb className="w-3 h-3 text-white" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 mt-0.5">
                                  <Sparkles className="w-3 h-3 text-white" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-200 break-words whitespace-pre-wrap">{msg.content}</p>
                                <p className="text-xs text-gray-500 mt-1">{formatTime(msg.timestamp)}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}

                        {isLoading && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-3 bg-gray-800 rounded-xl border border-gray-700"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                              <span className="text-sm text-gray-400">
                                {planMode ? 'Planning your website...' : 'Generating your website...'}
                              </span>
                            </div>
                            <Progress value={progress} className="h-1" />
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-gray-500">{progress}%</span>
                              {currentProvider && (
                                <span className="text-xs text-gray-500">Using {currentProvider}</span>
                              )}
                            </div>
                            {streamingText && (
                              <div className="mt-2 p-2 bg-gray-900 rounded text-xs text-gray-400 max-h-32 overflow-y-auto">
                                <pre className="whitespace-pre-wrap">{streamingText.slice(-500)}...</pre>
                              </div>
                            )}
                          </motion.div>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-800">
                      <div className="relative">
                        <Textarea
                          ref={textareaRef}
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={planMode 
                            ? "Describe your website idea and I'll create a plan..."
                            : "Describe changes or new features..."
                          }
                          className="min-h-[80px] resize-none bg-gray-800 border-gray-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-white placeholder:text-gray-500 pr-12"
                          disabled={isLoading}
                        />
                        <Button 
                          size="sm"
                          onClick={handleGenerate}
                          disabled={!prompt.trim() || isLoading}
                          className={`absolute bottom-3 right-3 ${planMode 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' 
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'}`}
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : planMode ? (
                            <Lightbulb className="w-4 h-4" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-600">⌘ + Enter to send</span>
                        <div className="flex items-center gap-2">
                          {planMode ? (
                            <Badge variant="outline" className="text-blue-400 border-blue-500/30">
                              <Lightbulb className="w-3 h-3 mr-1" />
                              Plan Mode
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                              <Hammer className="w-3 h-3 mr-1" />
                              Build Mode
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Plan Content */}
                  <TabsContent value="plan" className="flex-1 m-0 overflow-hidden data-[state=inactive]:hidden">
                    <ScrollArea className="p-4 h-full">
                      {plan.length > 0 ? (
                        <div className="space-y-4">
                          {plan.map((section, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                            >
                              <h4 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                {section.title}
                              </h4>
                              <p className="text-sm text-gray-300 whitespace-pre-wrap">{section.content}</p>
                            </motion.div>
                          ))}
                          
                          <Button 
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600"
                            onClick={() => {
                              setPlanMode(false);
                              // Auto-switch to build mode
                            }}
                          >
                            <Hammer className="w-4 h-4 mr-2" />
                            Start Building from Plan
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                            <Lightbulb className="w-8 h-8 text-blue-400" />
                          </div>
                          <h3 className="text-white font-medium mb-2">No Plan Yet</h3>
                          <p className="text-sm text-gray-500 mb-4">Switch to Chat and enable Plan Mode to create a detailed specification</p>
                          <Button 
                            variant="outline" 
                            onClick={() => setActiveTab('chat')}
                            className="border-gray-700 text-gray-300"
                          >
                            Go to Chat
                          </Button>
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  {/* Files Content */}
                  <TabsContent value="files" className="flex-1 m-0 overflow-hidden data-[state=inactive]:hidden">
                    <ScrollArea className="p-4 h-full">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 text-gray-300">
                          <Folder className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">src</span>
                        </div>
                        <div className="ml-4 space-y-1">
                          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-300 cursor-pointer">
                            <FileCode className="w-4 h-4 text-blue-400" />
                            <span className="text-sm">index.html</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-300 cursor-pointer">
                            <FileCode className="w-4 h-4 text-pink-400" />
                            <span className="text-sm">styles.css</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-300 cursor-pointer">
                            <FileCode className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm">script.js</span>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Sidebar Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-1/2 -translate-y-1/2 z-10 bg-gray-800 border border-gray-700 rounded-r-lg hover:bg-gray-700 text-gray-400 hover:text-white"
            style={{ left: sidebarOpen ? '400px' : '0' }}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeft className="w-4 h-4" />
            )}
          </Button>

          {/* Preview / Code Area */}
          <div className="flex-1 flex overflow-hidden bg-gray-950">
            {/* Code View */}
            {(viewMode === 'code' || viewMode === 'split') && (
              <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} border-r border-gray-800 overflow-hidden flex flex-col`}>
                <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-400">index.html</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs bg-gray-800 border-gray-700 text-gray-400">
                      HTML
                    </Badge>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <pre className="p-4 text-sm text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {code || <span className="text-gray-600">{"// Your generated code will appear here"}</span>}
                  </pre>
                </ScrollArea>
              </div>
            )}

            {/* Preview View */}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} bg-gray-900 overflow-hidden flex flex-col`}>
                <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-400">Preview</span>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeviceMode('desktop')}
                      className={`h-6 px-2 ${deviceMode === 'desktop' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
                    >
                      <Monitor className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeviceMode('tablet')}
                      className={`h-6 px-2 ${deviceMode === 'tablet' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
                    >
                      <Tablet className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeviceMode('mobile')}
                      className={`h-6 px-2 ${deviceMode === 'mobile' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
                    >
                      <Smartphone className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 flex items-start justify-center p-4 overflow-auto bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-gray-950">
                  <div className={`${getDeviceWidth()} bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300`}>
                    {code ? (
                      <iframe
                        ref={iframeRef}
                        srcDoc={code}
                        className="w-full h-full min-h-[600px]"
                        title="Preview"
                        sandbox="allow-scripts"
                      />
                    ) : (
                      <div className="h-full min-h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                            <Eye className="w-8 h-8 text-emerald-400" />
                          </div>
                          <h3 className="text-gray-900 font-medium mb-1">Preview</h3>
                          <p className="text-sm text-gray-500">Your website will appear here</p>
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
    </TooltipProvider>
  );
}
