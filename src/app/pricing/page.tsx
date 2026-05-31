'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Check, 
  X, 
  Sparkles, 
  Zap, 
  Crown, 
  Rocket,
  Code2,
  Globe,
  Users,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: { monthly: 0, yearly: 0 },
    icon: Sparkles,
    features: [
      { text: '5 projects', included: true },
      { text: 'Basic AI generation', included: true },
      { text: 'Community support', included: true },
      { text: '1 GB storage', included: true },
      { text: 'Custom domain', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started',
    popular: false,
    gradient: 'from-gray-600 to-gray-700'
  },
  {
    name: 'Pro',
    description: 'For serious developers',
    price: { monthly: 19, yearly: 190 },
    icon: Zap,
    features: [
      { text: 'Unlimited projects', included: true },
      { text: 'Advanced AI generation', included: true },
      { text: 'Priority support', included: true },
      { text: '10 GB storage', included: true },
      { text: 'Custom domain', included: true },
      { text: 'Team collaboration', included: false },
    ],
    cta: 'Start Free Trial',
    popular: true,
    gradient: 'from-emerald-600 to-teal-600'
  },
  {
    name: 'Enterprise',
    description: 'For teams and businesses',
    price: { monthly: 49, yearly: 490 },
    icon: Crown,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Team collaboration', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'Unlimited storage', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'SLA guarantee', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
    gradient: 'from-amber-500 to-orange-600'
  }
];

const faqs = [
  {
    question: 'Can I switch plans anytime?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any differences.'
  },
  {
    question: 'What AI models do you use?',
    answer: 'We use multiple AI providers including Z.AI, OpenRouter, and Groq to ensure the best results and maximum uptime.'
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer: 'Yes! Pro and Enterprise plans come with a 14-day free trial. No credit card required to start.'
  },
  {
    question: 'Can I export my code?',
    answer: 'Absolutely. You own all the code you generate. Export it as HTML, CSS, JavaScript, or download the complete project.'
  }
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">WebCraft AI</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/templates" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Templates
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-emerald-600 relative">
                Pricing
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-emerald-600 rounded-full" />
              </Link>
              <Link href="/docs" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Docs
              </Link>
            </div>

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
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50 to-white">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Badge variant="secondary" className="mb-4 px-4 py-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                Pricing
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Simple, transparent pricing
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose the perfect plan for your needs. Start for free and upgrade as you grow.
              </p>
            </motion.div>

            {/* Billing Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-8 flex items-center justify-center gap-4"
            >
              <span className={`text-sm ${!isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Monthly
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-emerald-600"
              />
              <span className={`text-sm ${isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Yearly
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 border-green-200">
                  Save 20%
                </Badge>
              </span>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Card className={`relative h-full ${plan.popular ? 'border-2 border-emerald-500 shadow-xl shadow-emerald-500/10' : 'border border-gray-200'}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                        <plan.icon className="w-7 h-7 text-white" />
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="text-center">
                      <div className="mb-6">
                        <span className="text-5xl font-bold text-gray-900">
                          ${isYearly ? plan.price.yearly : plan.price.monthly}
                        </span>
                        <span className="text-gray-500 ml-1">
                          /{isYearly ? 'year' : 'month'}
                        </span>
                      </div>
                      
                      <ul className="space-y-3 mb-8 text-left">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-3">
                            {feature.included ? (
                              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                <Check className="w-3 h-3 text-green-600" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                                <X className="w-3 h-3 text-gray-400" />
                              </div>
                            )}
                            <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button
                        className={`w-full ${plan.popular ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25' : 'bg-gray-900 hover:bg-gray-800'}`}
                        size="lg"
                      >
                        {plan.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Comparison */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why choose WebCraft AI?</h2>
              <p className="text-gray-600">Everything you need to build amazing websites</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Code2, title: 'AI-Powered', description: 'Generate complete websites from natural language' },
                { icon: Rocket, title: 'Fast Deployment', description: 'Deploy to Vercel with one click' },
                { icon: Globe, title: 'Custom Domains', description: 'Connect your own domain easily' },
                { icon: Users, title: 'Team Collaboration', description: 'Work together with your team' },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600">Everything you need to know about WebCraft AI</p>
            </div>
            
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-6"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-600 to-teal-700">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to start building?
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Join thousands of developers building with AI. Start for free today.
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-gray-100 px-8 shadow-xl">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} WebCraft AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
