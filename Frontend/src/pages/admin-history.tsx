import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { 
  FileVideo, Download, Eye, Clock, Chrome, BarChart3, 
  Search, Trash2, AlertTriangle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface TestRun {
  id: string;
  suite: string;
  browser: string;
  status: "passed" | "failed";
  date: string;
  time: string;
  duration: string;
  scripts: { name: string; status: "passed" | "failed" }[];
  artifacts: { screenshots: number; videos: boolean; logs: boolean };
}

const initialMockReports: TestRun[] = [
  {
    id: "1",
    suite: "Login & Checkout Flow",
    browser: "Chrome",
    status: "passed",
    date: "Nov 29, 2025",
    time: "10:30 AM",
    duration: "45s",
    scripts: [
      { name: "Navigate to Login", status: "passed" },
      { name: "Enter Credentials", status: "passed" },
      { name: "Verify Dashboard", status: "passed" },
    ],
    artifacts: { screenshots: 8, videos: true, logs: true }
  },
  {
    id: "2",
    suite: "Payment Gateway",
    browser: "Firefox",
    status: "failed",
    date: "Nov 29, 2025",
    time: "09:15 AM",
    duration: "52s",
    scripts: [
      { name: "Navigate to Cart", status: "passed" },
      { name: "Add Item", status: "passed" },
      { name: "Process Payment", status: "failed" },
    ],
    artifacts: { screenshots: 12, videos: true, logs: true }
  },
  {
    id: "3",
    suite: "User Registration",
    browser: "Chrome",
    status: "passed",
    date: "Nov 28, 2025",
    time: "02:45 PM",
    duration: "38s",
    scripts: [
      { name: "Fill Form", status: "passed" },
      { name: "Validate Email", status: "passed" },
      { name: "Complete Registration", status: "passed" },
    ],
    artifacts: { screenshots: 6, videos: false, logs: true }
  },
  {
    id: "4",
    suite: "Dashboard Analytics",
    browser: "Chrome",
    status: "passed",
    date: "Nov 27, 2025",
    time: "11:00 AM",
    duration: "41s",
    scripts: [
      { name: "Load Dashboard", status: "passed" },
      { name: "Verify Charts", status: "passed" },
      { name: "Check Data Accuracy", status: "passed" },
    ],
    artifacts: { screenshots: 7, videos: true, logs: true }
  },
  {
    id: "5",
    suite: "Search Functionality",
    browser: "Firefox",
    status: "failed",
    date: "Nov 26, 2025",
    time: "03:15 PM",
    duration: "35s",
    scripts: [
      { name: "Open Search", status: "passed" },
      { name: "Enter Query", status: "passed" },
      { name: "Verify Results", status: "failed" },
    ],
    artifacts: { screenshots: 5, videos: true, logs: true }
  },
];

export default function AdminHistory() {
  const [location] = useLocation();
  const reportRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [reports, setReports] = useState<TestRun[]>(initialMockReports);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [deleteTestDialogOpen, setDeleteTestDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);

  const filteredReports = reports.filter(report =>
    report.suite.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.browser.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.date.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteTest = () => {
    if (testToDelete) {
      setReports(prev => prev.filter(r => r.id !== testToDelete));
      setDeleteTestDialogOpen(false);
      setTestToDelete(null);
    }
  };

  const handleDeleteAll = () => {
    setReports([]);
    setDeleteAllDialogOpen(false);
  };

  const openDeleteTestDialog = (testId: string) => {
    setTestToDelete(testId);
    setDeleteTestDialogOpen(true);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const testId = params.get('testId');
    
    if (testId && reportRefs.current[testId]) {
      setTimeout(() => {
        reportRefs.current[testId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        reportRefs.current[testId]?.classList.add('ring-2', 'ring-green-500', 'ring-offset-2', 'dark:ring-offset-slate-950');
        setTimeout(() => {
          reportRefs.current[testId]?.classList.remove('ring-2', 'ring-green-500', 'ring-offset-2', 'dark:ring-offset-slate-950');
        }, 3000);
      }, 100);
    }
  }, [location]);

  return (
    <Layout role="admin">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-1">History</h1>
          <p className="text-slate-600 dark:text-slate-400">View all test execution results and artifacts.</p>
        </div>
        {reports.length > 0 && (
          <Button
            variant="outline"
            className="border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
            onClick={() => setDeleteAllDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete All
          </Button>
        )}
      </div>

      <GlassCard className="mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30">
              {filteredReports.length} Test Cases
            </Badge>
            <Badge className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/30">
              {filteredReports.filter(r => r.status === "passed").length} Passed
            </Badge>
            <Badge className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30">
              {filteredReports.filter(r => r.status === "failed").length} Failed
            </Badge>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by suite, browser, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
            />
          </div>
        </div>
      </GlassCard>

      <div className="space-y-6">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div
              key={report.id}
              ref={(el) => {
                if (el) reportRefs.current[report.id] = el;
              }}
            >
              <GlassCard className="group hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-white/5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{report.suite}</h3>
                      <Badge className={`${
                        report.status === "passed" 
                          ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20" 
                          : "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20"
                      } border capitalize text-xs`}>
                        {report.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Chrome className="w-4 h-4" />
                        {report.browser}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {report.duration}
                      </div>
                      <span>{report.date} at {report.time}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5">
                      <Eye className="w-4 h-4 mr-2" /> View
                    </Button>
                    <NeonButton size="sm" neonColor="blue">
                      <Download className="w-4 h-4 mr-2" /> Artifacts
                    </NeonButton>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                      onClick={() => openDeleteTestDialog(report.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Test Scripts
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {report.scripts.map((script, i) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 flex items-start gap-3">
                        <div className={`mt-0.5 w-2 h-2 rounded-full ${script.status === "passed" ? "bg-green-500" : "bg-red-500"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-900 dark:text-white truncate">{script.name}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-500 capitalize">{script.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300">
                    <FileVideo className="w-4 h-4" />
                    {report.artifacts.screenshots} Screenshots
                  </div>
                  {report.artifacts.videos && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300">
                      <FileVideo className="w-4 h-4" />
                      Video Recording
                    </div>
                  )}
                  {report.artifacts.logs && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300">
                      <FileVideo className="w-4 h-4" />
                      Execution Logs
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          ))
        ) : (
          <GlassCard className="text-center py-12">
            <BarChart3 className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {searchQuery ? "No Matching Test Cases" : "No Test Cases"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {searchQuery 
                ? `No test cases match "${searchQuery}"` 
                : "There are no test execution records yet."}
            </p>
          </GlassCard>
        )}
      </div>

      <Dialog open={deleteTestDialogOpen} onOpenChange={setDeleteTestDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl border-slate-200 dark:border-white/10 text-slate-900 dark:text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Test Case
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this test case? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button 
              className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10"
              onClick={() => setDeleteTestDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteTest}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl border-slate-200 dark:border-white/10 text-slate-900 dark:text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete All Test Cases
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete all {reports.length} test cases? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button 
              className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10"
              onClick={() => setDeleteAllDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteAll}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete All
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
