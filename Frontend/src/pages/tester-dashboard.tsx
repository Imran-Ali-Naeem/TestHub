import Layout from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, XCircle, Zap } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

const executionData = [
  { name: "Chrome", passed: 28, failed: 2 },
  { name: "Firefox", passed: 26, failed: 4 },
];

const recentRuns = [
  { id: 1, suite: "Login & Checkout Flow", browser: "Chrome", status: "passed", time: "2m ago", duration: "45s" },
  { id: 2, suite: "Payment Gateway", browser: "Firefox", status: "failed", time: "15m ago", duration: "52s" },
  { id: 3, suite: "Dashboard Validation", browser: "Chrome", status: "passed", time: "1h ago", duration: "38s" },
  { id: 4, suite: "User Registration", browser: "Both", status: "passed", time: "2h ago", duration: "1m 20s" },
];

export default function TesterDashboard() {
  return (
    <Layout role="user">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-1">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Your automated test execution environment</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard glow className="relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-xl" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Total Executions</span>
            <Zap className="text-blue-600 dark:text-blue-400 w-5 h-5" />
          </div>
          <div className="text-4xl font-bold font-display text-slate-900 dark:text-white">892</div>
          <div className="text-sm text-green-600 dark:text-green-400 mt-2">+45 this week</div>
        </GlassCard>

        <GlassCard className="relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 dark:bg-green-500/20 rounded-full blur-xl" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Pass Rate</span>
            <CheckCircle2 className="text-green-600 dark:text-green-400 w-5 h-5" />
          </div>
          <div className="text-4xl font-bold font-display text-slate-900 dark:text-white">94.3%</div>
          <div className="text-sm text-green-600 dark:text-green-400 mt-2">+1.2% this month</div>
        </GlassCard>

        <GlassCard className="relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 dark:bg-red-500/20 rounded-full blur-xl" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Failed Runs</span>
            <XCircle className="text-red-600 dark:text-red-400 w-5 h-5" />
          </div>
          <div className="text-4xl font-bold font-display text-slate-900 dark:text-white">52</div>
          <div className="text-sm text-red-600 dark:text-red-400 mt-2">5 critical failures</div>
        </GlassCard>

        <GlassCard className="relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-xl" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Avg Execution</span>
            <Clock className="text-cyan-600 dark:text-cyan-400 w-5 h-5" />
          </div>
          <div className="text-4xl font-bold font-display text-slate-900 dark:text-white">48s</div>
          <div className="text-sm text-green-600 dark:text-green-400 mt-2">-3s optimization</div>
        </GlassCard>
      </div>

      {/* Chart */}
      <GlassCard>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Browser-wise Performance</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Pass/Fail distribution across browsers</p>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={executionData}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                cursor={{fill: 'rgba(59,130,246,0.1)'}}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #dbeafe', borderRadius: '8px', color: '#000' }}
              />
              <Bar dataKey="passed" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </Layout>
  );
}
