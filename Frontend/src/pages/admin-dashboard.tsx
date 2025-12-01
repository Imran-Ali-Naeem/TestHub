import Layout from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Users, Database, Server, ShieldAlert, Activity } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

const resourceData = [
  { name: 'Node 1', load: 45 },
  { name: 'Node 2', load: 72 },
  { name: 'Node 3', load: 28 },
  { name: 'Node 4', load: 91 },
  { name: 'Node 5', load: 55 },
];

export default function AdminDashboard() {
  return (
    <Layout role="admin">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-1">Admin Control</h1>
        <p className="text-slate-600 dark:text-slate-400">System Infrastructure & User Management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Active Users</p>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">842</h2>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 h-1 bg-blue-200 dark:bg-blue-900/50 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[70%]" />
          </div>
        </GlassCard>

        <GlassCard className="bg-cyan-50 dark:bg-cyan-900/10 border-cyan-200 dark:border-cyan-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-cyan-700 dark:text-cyan-300 mb-1">Test Suites</p>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">1,205</h2>
            </div>
            <div className="p-2 bg-cyan-100 dark:bg-cyan-500/20 rounded-lg">
              <Database className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
          <div className="mt-4 h-1 bg-cyan-200 dark:bg-cyan-900/50 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 w-[45%]" />
          </div>
        </GlassCard>

        <GlassCard className="bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">Server Load</p>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">42%</h2>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
              <Server className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 h-1 bg-purple-200 dark:bg-purple-900/50 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 w-[42%]" />
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Node Resource Usage
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                   cursor={{fill: 'rgba(59,130,246,0.1)'}}
                   contentStyle={{ backgroundColor: '#fff', border: '1px solid #dbeafe', borderRadius: '8px', color: '#000' }}
                />
                <Bar dataKey="load" radius={[4, 4, 0, 0]}>
                  {resourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.load > 80 ? '#ef4444' : '#2563eb'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            System Alerts
          </h3>
          <div className="space-y-4">
            {[
              { type: "warning", msg: "Node 4 approaching memory limit (91%)", time: "10m ago" },
              { type: "info", msg: "Database backup completed successfully", time: "1h ago" },
              { type: "error", msg: "Failed login attempts detected", time: "2h ago" },
              { type: "info", msg: "New deployment v1.0.0 live", time: "1d ago" },
            ].map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
                <div className={`mt-1 w-2 h-2 rounded-full ${
                  alert.type === 'error' ? 'bg-red-500' : 
                  alert.type === 'warning' ? 'bg-orange-500' : 
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-slate-900 dark:text-white">{alert.msg}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
}
