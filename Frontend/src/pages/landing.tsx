import { useState, useEffect } from "react";
import { Link } from "wouter";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassCard } from "@/components/ui/glass-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Shield, Zap, Globe, Code2, Github, ArrowRight } from "lucide-react";
import TestAutomationNetwork from "@/components/test-automation-network";
import { ParticleBackground } from "@/components/particle-background";

export default function LandingPage() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-sans overflow-x-hidden transition-colors">
      <ParticleBackground />
      {/* Hero Section with Canvas Animation */}
      <section className="relative min-h-screen">
        {/* Full background canvas */}
        <div className="absolute inset-0">
          <TestAutomationNetwork />
        </div>

        {/* Header Overlay */}
        <header className="relative z-50 border-b border-white/10 bg-slate-950/40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.6)]">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold font-display tracking-wider text-white">
                  TESTHUB
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">How It Works</a>
              <a href="#integrations" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Integrations</a>
              <a href="#docs" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Docs</a>
            </nav>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/auth">
                <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Log In
                </button>
              </Link>
              <Link href="/auth">
                <NeonButton size="sm" neonColor="blue">
                  Sign Up Free
                </NeonButton>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Content with proper layering */}
        <div className="relative z-20 h-[calc(100vh-80px)] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/50 to-transparent" />
          
          {showContent && (
            <div className="relative z-30 text-left space-y-8 px-6 md:px-12 max-w-2xl animate-in fade-in duration-1000">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300">
                  Automated Testing.
                  <br />
                  Simplified
                </h1>
                <div className="h-1 w-48 bg-gradient-to-r from-cyan-500 to-transparent rounded-full" />
              </div>
              <p className="text-lg md:text-xl text-cyan-100/90 max-w-xl font-medium">
                Execute parallel tests across browsers with real-time monitoring and comprehensive artifacts.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/auth">
                  <NeonButton className="h-14 px-8 text-lg" neonColor="blue">
                    Get Started Free
                  </NeonButton>
                </Link>
                <button className="h-14 px-8 text-lg font-medium border border-cyan-400/50 hover:border-cyan-400/80 hover:bg-cyan-400/10 rounded-lg transition-all flex items-center justify-center gap-2 group text-white">
                  <Github className="w-5 h-5" />
                  View on GitHub
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
          <div className="w-8 h-12 border-2 border-cyan-400 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-20 max-w-7xl mx-auto px-6 py-20 bg-white dark:bg-slate-950">
        <h2 className="text-4xl font-display font-bold mb-16 text-center text-slate-900 dark:text-white">Why Choose TESTHUB?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Code2, title: "Unified Framework", desc: "Write tests easily with Selenium, Playwright, & Cypress" },
            { icon: Zap, title: "Parallel Execution", desc: "Run multiple tests concurrently across browsers" },
            { icon: Globe, title: "Open-Source & Extensible", desc: "Full code access, integrate with any environment" }
          ].map((feature, i) => (
            <GlassCard key={i} className="group bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                <feature.icon className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-300">{feature.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* See It In Action Section */}
      <section id="how-it-works" className="relative z-20 max-w-7xl mx-auto px-6 py-20 bg-white dark:bg-slate-950">
        <h2 className="text-4xl font-display font-bold mb-12 text-center text-slate-900 dark:text-white">See It In Action</h2>
        
        <GlassCard className="bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-white/20 p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-blue-600 dark:text-cyan-400">Live Run Monitor</h3>
              <p className="text-slate-700 dark:text-slate-300 font-mono text-sm">
                <span className="text-green-600 dark:text-green-400">✓ Running login test on Chrome...</span><br />
                <span className="text-blue-600 dark:text-blue-400">⟳ Executing payment flow...</span><br />
                <span className="text-green-600 dark:text-green-400">✓ Screenshot captured (342ms)</span><br />
                <span className="text-green-600 dark:text-green-400">✓ All validations passed!</span><br />
                <span className="text-slate-600 dark:text-slate-500">Total time: 2.45s</span>
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-blue-600 dark:text-cyan-400">Running tests on Chrome...</h3>
              <p className="text-slate-700 dark:text-slate-300 font-mono text-sm">
                <span className="text-cyan-600 dark:text-cyan-400">• Suite: E-Commerce Flow</span><br />
                <span className="text-cyan-600 dark:text-cyan-400">• Browser: Chrome v120</span><br />
                <span className="text-green-600 dark:text-green-400">✓ 12/12 tests passed</span><br />
                <span className="text-yellow-600 dark:text-yellow-400">⚠ 1 slow test detected</span><br />
                <span className="text-slate-600 dark:text-slate-500">View full report →</span>
              </p>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="relative z-20 max-w-7xl mx-auto px-6 py-20 bg-white dark:bg-slate-950">
        <h2 className="text-3xl font-display font-bold mb-8 text-slate-900 dark:text-white">Connect Your Stack</h2>
        <div className="flex flex-wrap gap-4 mb-16">
          {["GlobivateC orp", "DataFlow Inc.", "Jira", "CloudEnv", "CloudEnv", "SkaleiT"].map((partner, i) => (
            <div key={i} className="px-6 py-3 rounded-lg border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-medium">
              {partner}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Trusted By</h3>
          <div className="flex gap-4 text-slate-600 dark:text-slate-400 font-medium">
            {["Enterprise", "Startups", "Teams"].map((tag, i) => (
              <span key={i}>{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 py-20 bg-white dark:bg-slate-950">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-12 text-center space-y-6">
          <h2 className="text-4xl font-display font-bold text-white">Ready to Automate Your Tests?</h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Start for free. No credit card required.
          </p>
          <Link href="/auth">
            <button className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white text-blue-600 font-bold text-lg hover:bg-slate-100 transition-colors group">
              Get Started Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <span className="font-bold font-display text-lg text-slate-900 dark:text-white">TESTHUB</span>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">Building the next generation of automated testing for engineering teams</p>
            </div>
            
            {[
              { title: "Platform", links: ["Features", "Pricing", "Security"] },
              { title: "Resources", links: ["Documentation", "Blog", "Community"] },
              { title: "Legal", links: ["Privacy", "Terms", "Contact"] }
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-bold mb-4 text-slate-900 dark:text-white">{col.title}</h4>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                  {col.links.map((link, j) => (
                    <li key={j}><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 dark:border-white/10 pt-8 flex justify-between items-center text-slate-600 dark:text-slate-500 text-sm">
            <p>&copy; 2025 TESTHUB Inc. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
