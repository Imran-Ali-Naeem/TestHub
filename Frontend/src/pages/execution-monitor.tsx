import Layout from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Terminal, Check, X, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ExecutionMonitor() {
  const steps = [
    { id: 1, name: "Initialize Browser", status: "completed", time: "0.8s" },
    { id: 2, name: "Navigate to /login", status: "completed", time: "1.2s" },
    { id: 3, name: "Input Credentials", status: "completed", time: "0.5s" },
    { id: 4, name: "Submit Form", status: "running", time: "..." },
    { id: 5, name: "Verify Dashboard", status: "pending", time: "-" },
    { id: 6, name: "Check User Profile", status: "pending", time: "-" },
  ];

  const logs = [
    { time: "10:42:01", level: "INFO", msg: "Starting Test Suite: Auth Flow" },
    { time: "10:42:02", level: "INFO", msg: "Browser context initialized" },
    { time: "10:42:03", level: "DEBUG", msg: "Navigating to https://staging.app.com/login" },
    { time: "10:42:04", level: "INFO", msg: "Page loaded successfully" },
    { time: "10:42:05", level: "INFO", msg: "Found selector #email-input" },
  ];

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-display font-bold text-white">Live Execution</h1>
            <Badge className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border-blue-500/50 animate-pulse">
              RUNNING
            </Badge>
          </div>
          <p className="text-slate-400">Session ID: #EXE-8829-XJ</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
            <Pause className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Main Viewport (Browser Preview) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GlassCard className="flex-1 p-0 overflow-hidden flex flex-col bg-black border-slate-800">
            <div className="h-10 bg-slate-900 border-b border-white/5 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="flex-1 mx-4 bg-slate-950 rounded h-6 flex items-center px-3 text-xs text-slate-500 font-mono">
                https://staging.app.com/login
              </div>
            </div>
            <div className="flex-1 relative bg-slate-900/50 flex items-center justify-center">
              {/* Placeholder for browser stream */}
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 opacity-50"></div>
                <p className="text-slate-500 font-mono">Live Stream Active</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="h-64 flex flex-col">
             <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-300">
               <Terminal className="w-4 h-4 text-cyan-400" /> Console Output
             </div>
             <ScrollArea className="flex-1 font-mono text-xs">
               <div className="space-y-1">
                 {logs.map((log, i) => (
                   <div key={i} className="flex gap-3 hover:bg-white/5 px-2 py-1 rounded">
                     <span className="text-slate-500">{log.time}</span>
                     <span className={
                       log.level === 'INFO' ? 'text-blue-400' : 
                       log.level === 'DEBUG' ? 'text-slate-400' : 'text-red-400'
                     }>{log.level}</span>
                     <span className="text-slate-300">{log.msg}</span>
                   </div>
                 ))}
                 <div className="flex gap-3 px-2 py-1 animate-pulse">
                   <span className="text-slate-600">10:42:06</span>
                   <span className="text-blue-400">INFO</span>
                   <span className="text-slate-300">Typing into input[name="password"]...</span>
                 </div>
               </div>
             </ScrollArea>
          </GlassCard>
        </div>

        {/* Timeline Sidebar */}
        <GlassCard className="flex flex-col h-full">
          <h3 className="text-lg font-semibold text-white mb-4">Execution Timeline</h3>
          <div className="relative pl-4 border-l border-white/10 space-y-8">
            {steps.map((step) => (
              <div key={step.id} className="relative">
                <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 ${
                  step.status === 'completed' ? 'bg-green-500 border-green-500 shadow-[0_0_10px_#22c55e]' :
                  step.status === 'running' ? 'bg-blue-500 border-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]' :
                  'bg-slate-900 border-slate-600'
                }`} />
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-sm font-medium ${
                      step.status === 'pending' ? 'text-slate-500' : 'text-white'
                    }`}>{step.name}</p>
                    <p className="text-xs text-slate-500">{step.status}</p>
                  </div>
                  <span className="text-xs font-mono text-slate-600">{step.time}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
}
