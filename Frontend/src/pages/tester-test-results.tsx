import { useState, useEffect, useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import Layout from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Download, Play, Image as ImageIcon, FileText,
  Video, Clock, Chrome, CheckCircle2, XCircle, AlertCircle,
  ZoomIn, X, ChevronLeft, ChevronRight, Loader2, Globe, Copy, Check
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { API_ENDPOINTS } from "@/lib/apiConfig";

interface Screenshot {
  id: string;
  name: string;
  timestamp: string;
  url: string;
  step: string;
  test_name?: string;
  browser?: string;
  size_bytes?: number;
}

interface LogEntry {
  timestamp: string;
  level: "info" | "warning" | "error";
  message: string;
  test_name?: string;
  browser?: string;
}

interface VideoRecording {
  id: string;
  name: string;
  duration: string;
  size: string;
  url: string;
  test_name?: string;
  browser?: string;
}

interface TestSuite {
  id: string;
  suite_id: string;
  run_id: string;
  username: string;
  browsers: string[];
  total_tests: number;
  passed: number;
  failed: number;
  success_rate: number;
  total_duration: number;
  duration_seconds: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TestResult {
  id: string;
  suite_id: string;
  test_name: string;
  browser: string;
  status: string;
  duration_seconds: number;
  start_time: string;
  end_time: string;
  error_message?: string;
}

export default function TesterTestResults() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/tester/test-results/:id");
  const testId = params?.id;

  const [selectedImage, setSelectedImage] = useState<Screenshot | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"screenshots" | "logs" | "videos">("screenshots");
  const [selectedVideo, setSelectedVideo] = useState<VideoRecording | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Browser tab + script filter
  const [selectedBrowser, setSelectedBrowser] = useState<string>("all");
  const [selectedScript, setSelectedScript] = useState<string>("all");

  // API State
  const [testSuite, setTestSuite] = useState<TestSuite | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [videos, setVideos] = useState<VideoRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derived: unique browsers from results
  const uniqueBrowsers = useMemo(() => {
    const browsers = new Set<string>();
    if (testSuite?.browsers) testSuite.browsers.forEach(b => browsers.add(b));
    testResults.forEach(r => { if (r.browser) browsers.add(r.browser); });
    return Array.from(browsers).sort();
  }, [testResults, testSuite]);

  // Derived: unique script names (clean display name -> raw name mapping)
  const uniqueScripts = useMemo(() => {
    const scripts = new Set<string>();
    testResults.forEach(r => { if (r.test_name) scripts.add(r.test_name); });
    return Array.from(scripts).sort();
  }, [testResults]);

  // Helper: clean test name for display
  const cleanTestName = (name: string) => name.replace(/_\d{8}_\d{6}$/, '');

  // Clean video filename for display: "firefox_test_github_20260221_195500_20260221_195507_329745.mp4" → "firefox_test_github"
  const cleanVideoName = (name: string) => {
    return name
      .replace(/\.mp4$/i, '')           // Remove extension
      .replace(/_\d{8}_\d{6}/g, '')     // Remove all timestamp patterns (YYYYMMDD_HHMMSS)
      .replace(/_\d{4,}$/g, '')          // Remove trailing microseconds
      .replace(/_+$/, '');               // Remove trailing underscores
  };

  // Filtered data based on selected browser + script
  const filteredResults = useMemo(() => {
    return testResults.filter(r => {
      if (selectedBrowser !== "all" && r.browser?.toLowerCase() !== selectedBrowser.toLowerCase()) return false;
      if (selectedScript !== "all" && r.test_name !== selectedScript) return false;
      return true;
    });
  }, [testResults, selectedBrowser, selectedScript]);

  const filteredScreenshots = useMemo(() => {
    return screenshots.filter(s => {
      if (selectedBrowser !== "all" && s.browser && s.browser.toLowerCase() !== selectedBrowser.toLowerCase()) return false;
      if (selectedScript !== "all" && s.test_name && !s.test_name.startsWith(selectedScript.replace(/_\d{8}_\d{6}$/, ''))) return false;
      return true;
    });
  }, [screenshots, selectedBrowser, selectedScript]);

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      if (selectedBrowser !== "all" && l.browser && l.browser.toLowerCase() !== selectedBrowser.toLowerCase()) return false;
      if (selectedScript !== "all" && l.test_name && !l.test_name.startsWith(selectedScript.replace(/_\d{8}_\d{6}$/, ''))) return false;
      return true;
    });
  }, [logs, selectedBrowser, selectedScript]);

  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      if (selectedBrowser !== "all" && v.browser && v.browser.toLowerCase() !== selectedBrowser.toLowerCase()) return false;
      if (selectedScript !== "all" && v.test_name && !v.test_name.startsWith(selectedScript.replace(/_\d{8}_\d{6}$/, ''))) return false;
      return true;
    });
  }, [videos, selectedBrowser, selectedScript]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!testId) return;
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) { setError('No authentication token found'); setLoading(false); return; }

      try {
        const res = await fetch(API_ENDPOINTS.TEST_SUITE_DETAILS(testId), {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = await res.json();

        setTestSuite(data.run || data.suite || null);
        setTestResults(data.results || []);
        setVideos(data.videos || []);
        setScreenshots(data.screenshots || []);
        setLogs(data.logs || []);

        if (!data.run && !data.suite) throw new Error('Run data not found');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load test results');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [testId]);

  // Image viewer
  const openImageViewer = (screenshot: Screenshot, index: number) => {
    setSelectedImage(screenshot);
    setCurrentImageIndex(index);
  };
  const closeImageViewer = () => setSelectedImage(null);
  const navigateImage = (direction: "prev" | "next") => {
    const len = filteredScreenshots.length;
    const idx = direction === "prev" ? (currentImageIndex - 1 + len) % len : (currentImageIndex + 1) % len;
    setCurrentImageIndex(idx);
    setSelectedImage(filteredScreenshots[idx]);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error": return "text-red-600 dark:text-red-400";
      case "warning": return "text-yellow-600 dark:text-yellow-400";
      default: return "text-slate-600 dark:text-slate-400";
    }
  };
  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error": return <XCircle className="w-4 h-4" />;
      case "warning": return <AlertCircle className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const handleCopyLogs = async () => {
    try {
      const logText = filteredLogs.map(log => {
        const browserTag = log.browser ? `[${log.browser}]` : '';
        return `${log.timestamp} ${browserTag} [${log.level.toUpperCase()}] ${log.message}`;
      }).join('\n');
      
      await navigator.clipboard.writeText(logText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy logs:', err);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try { const d = new Date(dateString); return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return 'N/A'; }
  };
  const formatTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try { const d = new Date(dateString); return isNaN(d.getTime()) ? 'N/A' : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); }
    catch { return 'N/A'; }
  };
  const formatTimePrecise = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try { const d = new Date(dateString); return isNaN(d.getTime()) ? 'N/A' : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }); }
    catch { return 'N/A'; }
  };

  const getStatus = () => {
    if (!testSuite) return 'running';
    if (testSuite.status === 'completed') return testSuite.failed === 0 ? 'passed' : 'failed';
    return testSuite.status;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading test results...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !testSuite) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Error Loading Test Results</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{error || 'Test suite not found'}</p>
            <Button onClick={() => navigate("/history")}>Back to History</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const status = getStatus();
  const duration = testSuite.total_duration ? Math.round(testSuite.total_duration) : (testSuite.duration_seconds ? Math.round(testSuite.duration_seconds) : 0);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4 -ml-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          onClick={() => navigate("/history")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to History
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">
                Test Run {testSuite.suite_id || testSuite.run_id}
              </h1>
              <Badge className={`${
                status === "passed"
                  ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20"
                  : status === "failed"
                  ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20"
                  : "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20"
              } border capitalize text-xs sm:text-sm`}>
                {status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {uniqueBrowsers.map(b => (
                <Badge key={b} className={`text-xs border ${
                  b === 'chrome'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20'
                }`}>
                  {b === 'chrome' ? <Chrome className="w-3 h-3 mr-1" /> : <Globe className="w-3 h-3 mr-1" />}
                  {b}
                </Badge>
              ))}
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {duration}s
              </div>
              <span>{formatDate(testSuite.created_at)} at {formatTime(testSuite.created_at)}</span>
            </div>
          </div>
          <NeonButton onClick={() => alert("Downloading all your test artifacts...")} neonColor="blue" className="w-full lg:w-auto text-sm">
            <Download className="w-4 h-4 mr-2" /> Download All Artifacts
          </NeonButton>
        </div>
      </div>

      {/* Test Results with Browser Tabs & Script Buttons */}
      <GlassCard className="mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Test Results ({filteredResults.length} {filteredResults.length === 1 ? 'test' : 'tests'})
        </h3>

        {/* Browser Tabs */}
        {uniqueBrowsers.length > 0 && (
          <div className="flex items-center border-b border-slate-200 dark:border-white/10 mb-4 overflow-x-auto">
            <button
              onClick={() => { setSelectedBrowser("all"); setSelectedScript("all"); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                selectedBrowser === "all"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              All Browsers
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0 h-5 bg-slate-200 dark:bg-slate-700">
                {testResults.length}
              </Badge>
            </button>
            {uniqueBrowsers.map(browser => {
              const count = testResults.filter(r => r.browser?.toLowerCase() === browser.toLowerCase()).length;
              return (
                <button
                  key={browser}
                  onClick={() => { setSelectedBrowser(browser); setSelectedScript("all"); }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    selectedBrowser === browser
                      ? browser === 'chrome'
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-orange-500 text-orange-600 dark:text-orange-400"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {browser === 'chrome' ? <Chrome className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                  <span className="capitalize">{browser}</span>
                  <Badge variant="secondary" className={`ml-1 text-xs px-1.5 py-0 h-5 ${
                    browser === 'chrome'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                  }`}>
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        )}

        {/* Script Name Buttons */}
        {uniqueScripts.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedScript("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                selectedScript === "all"
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              All Scripts
            </button>
            {uniqueScripts.map(script => {
              const scriptResults = testResults.filter(r => r.test_name === script && (selectedBrowser === "all" || r.browser?.toLowerCase() === selectedBrowser.toLowerCase()));
              const hasPassed = scriptResults.some(r => r.status?.toUpperCase() === "PASSED");
              const hasFailed = scriptResults.some(r => r.status?.toUpperCase() === "FAILED");
              return (
                <button
                  key={script}
                  onClick={() => setSelectedScript(script)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5 ${
                    selectedScript === script
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {selectedScript !== script && (
                    hasFailed ? <XCircle className="w-3 h-3 text-red-500" /> : hasPassed ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Clock className="w-3 h-3 text-blue-500" />
                  )}
                  {cleanTestName(script)}
                </button>
              );
            })}
          </div>
        )}

        {/* Results Grid */}
        {filteredResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredResults.map((result, i) => (
              <button
                key={i}
                onClick={() => setSelectedScript(result.test_name)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  selectedScript === result.test_name
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-500/30 ring-1 ring-blue-400"
                    : "bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.status?.toUpperCase() === "PASSED" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : result.status?.toUpperCase() === "FAILED" ? (
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                      {cleanTestName(result.test_name)}
                    </p>
                    <div className="flex items-center gap-2 mb-1">
                      {result.browser && (
                        <Badge className={`text-[10px] px-1.5 py-0 border ${
                          result.browser === 'chrome'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
                            : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20'
                        }`}>
                          {result.browser}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Duration: {Math.round(result.duration_seconds)}s
                    </p>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <p className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                        ▶ Start: {formatTimePrecise(result.start_time)}
                      </p>
                      <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
                        ■ End: {formatTimePrecise(result.end_time)}
                      </p>
                    </div>
                    {result.error_message && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1 truncate">{result.error_message}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-600 dark:text-slate-400">
            <p>No test results match the current filters.</p>
          </div>
        )}
      </GlassCard>

      {/* Artifact Tabs: Screenshots / Logs / Videos */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-slate-200 dark:border-white/10 overflow-x-auto">
        <button
          onClick={() => setActiveTab("screenshots")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
            activeTab === "screenshots" ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Screenshots ({filteredScreenshots.length})
          </div>
          {activeTab === "screenshots" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
            activeTab === "logs" ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Logs ({filteredLogs.length})
          </div>
          {activeTab === "logs" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
        </button>
        <button
          onClick={() => setActiveTab("videos")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
            activeTab === "videos" ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4" /> Videos ({filteredVideos.length})
          </div>
          {activeTab === "videos" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
        </button>
      </div>

      {/* Active filter indicator */}
      {(selectedBrowser !== "all" || selectedScript !== "all") && (
        <div className="flex items-center gap-2 mb-4 text-xs text-slate-500 dark:text-slate-400">
          <span>Filtered by:</span>
          {selectedBrowser !== "all" && (
            <Badge className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600">
              {selectedBrowser}
            </Badge>
          )}
          {selectedScript !== "all" && (
            <Badge className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600">
              {cleanTestName(selectedScript)}
            </Badge>
          )}
          <button onClick={() => { setSelectedBrowser("all"); setSelectedScript("all"); }} className="text-blue-500 hover:text-blue-400 underline">
            Clear filters
          </button>
        </div>
      )}

      {/* Screenshots Tab */}
      {activeTab === "screenshots" && (
        filteredScreenshots.length === 0 ? (
          <GlassCard className="text-center py-12">
            <ImageIcon className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Screenshots</h3>
            <p className="text-slate-600 dark:text-slate-400">
              {screenshots.length > 0 ? "No screenshots match the current filters." : "No screenshots were captured during this test."}
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScreenshots.map((screenshot, index) => (
              <GlassCard
                key={screenshot.id}
                className="group cursor-pointer hover:shadow-xl transition-all overflow-hidden"
                onClick={() => openImageViewer(screenshot, index)}
              >
                <div className="aspect-video bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
                  <img
                    src={API_ENDPOINTS.SCREENSHOT_IMAGE(screenshot.id)}
                    alt={screenshot.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.fallback-icon')) {
                        const div = document.createElement('div');
                        div.className = 'fallback-icon absolute inset-0 flex items-center justify-center';
                        div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-slate-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                        parent.appendChild(div);
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-slate-900 dark:text-white mb-1 truncate">{screenshot.name}</p>
                  <div className="flex items-center gap-2 mb-1">
                    {screenshot.test_name && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{cleanTestName(screenshot.test_name)}</span>
                    )}
                    {screenshot.browser && (
                      <Badge className={`text-[10px] px-1.5 py-0 border ${
                        screenshot.browser === 'chrome'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20'
                      }`}>
                        {screenshot.browser}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Step: {screenshot.step}</p>
                  <p className="text-xs text-slate-500">{screenshot.timestamp}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        )
      )}

      {/* Logs Tab */}
      {activeTab === "logs" && (
        filteredLogs.length === 0 ? (
          <GlassCard className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Logs</h3>
            <p className="text-slate-600 dark:text-slate-400">
              {logs.length > 0 ? "No logs match the current filters." : "No logs were captured during this test."}
            </p>
          </GlassCard>
        ) : (
          <GlassCard>
            <div className="mb-4 flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCopyLogs}
                className={copySuccess ? "border-green-500 text-green-600 dark:text-green-400" : ""}
              >
                {copySuccess ? (
                  <><Check className="w-4 h-4 mr-2" /> Copied!</>
                ) : (
                  <><Copy className="w-4 h-4 mr-2" /> Copy Logs</>
                )}
              </Button>
              <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Download Logs</Button>
            </div>
            <div className="bg-slate-900 dark:bg-black rounded-lg p-4 font-mono text-sm max-h-[600px] overflow-y-auto">
              {filteredLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-3 py-1 hover:bg-white/5">
                  <span className="text-slate-500 text-xs shrink-0 w-20">{log.timestamp}</span>
                  {log.browser && (
                    <span className={`text-xs shrink-0 px-1 rounded ${
                      log.browser === 'chrome' ? 'text-blue-400 bg-blue-950/50' : 'text-orange-400 bg-orange-950/50'
                    }`}>{log.browser}</span>
                  )}
                  <span className={`shrink-0 ${getLevelColor(log.level)}`}>{getLevelIcon(log.level)}</span>
                  <span className={`${getLevelColor(log.level)} flex-1`}>{log.message}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )
      )}

      {/* Videos Tab */}
      {activeTab === "videos" && (
        filteredVideos.length === 0 ? (
          <GlassCard className="text-center py-12">
            <Video className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Videos</h3>
            <p className="text-slate-600 dark:text-slate-400">
              {videos.length > 0 ? "No videos match the current filters." : "No videos were captured during this test."}
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {filteredVideos.map((video, index) => (
              <GlassCard key={index}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Video className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm sm:text-base font-medium text-slate-900 dark:text-white truncate" title={video.name}>{cleanVideoName(video.name)}</h3>
                        {video.browser && (
                          <Badge className={`text-[10px] px-1.5 py-0 border shrink-0 ${
                            video.browser === 'chrome'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
                              : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20'
                          }`}>
                            {video.browser}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                        {video.test_name && <span>Script: {cleanTestName(video.test_name)}</span>}
                        {video.test_name && <span>&bull;</span>}
                        <span>Duration: {video.duration}</span>
                        <span>&bull;</span>
                        <span>Size: {video.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 self-end sm:self-center">
                    <Button variant="outline" size="sm" onClick={() => setSelectedVideo(video)}>
                      <Play className="w-4 h-4 mr-2" /> Play
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      const link = document.createElement('a');
                      link.href = video.url;
                      link.download = video.name;
                      link.click();
                    }}>
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )
      )}

      {/* Image Viewer Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={closeImageViewer}>
        <DialogContent className="max-w-5xl w-full h-[90vh] bg-black/95 border-0 p-0">
          <div className="relative w-full h-full flex flex-col">
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <p className="font-medium">{selectedImage?.name}</p>
                  <p className="text-sm text-white/70">{selectedImage?.step}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = selectedImage?.id ? API_ENDPOINTS.SCREENSHOT_IMAGE(selectedImage.id) : '';
                      link.download = selectedImage?.name || 'screenshot.png';
                      link.click();
                    }}>
                    <Download className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={closeImageViewer}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
              <img
                src={selectedImage?.id ? API_ENDPOINTS.SCREENSHOT_IMAGE(selectedImage.id) : ''}
                alt={selectedImage?.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="absolute top-1/2 left-4 -translate-y-1/2">
              <Button variant="ghost" size="icon" className="text-white bg-black/50 hover:bg-black/70 w-12 h-12" onClick={() => navigateImage("prev")}>
                <ChevronLeft className="w-6 h-6" />
              </Button>
            </div>
            <div className="absolute top-1/2 right-4 -translate-y-1/2">
              <Button variant="ghost" size="icon" className="text-white bg-black/50 hover:bg-black/70 w-12 h-12" onClick={() => navigateImage("next")}>
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="text-center text-white/70 text-sm">
                {currentImageIndex + 1} / {filteredScreenshots.length}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl w-full bg-slate-900/95 dark:bg-black/95 border-slate-700 dark:border-white/10 p-0">
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <p className="font-medium">{selectedVideo ? cleanVideoName(selectedVideo.name) : ''}</p>
                  <p className="text-sm text-white/70">Duration: {selectedVideo?.duration} | Size: {selectedVideo?.size}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setSelectedVideo(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="p-4 pt-20">
              <video controls className="w-full rounded-lg" src={selectedVideo?.id ? API_ENDPOINTS.VIDEO_STREAM(selectedVideo.id) : ''} autoPlay>
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="p-4 bg-gradient-to-t from-black/80 to-transparent">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => {
                if (selectedVideo?.id) {
                  const link = document.createElement('a');
                  link.href = API_ENDPOINTS.VIDEO_STREAM(selectedVideo.id);
                  link.download = selectedVideo.name;
                  link.click();
                }
              }}>
                <Download className="w-4 h-4 mr-2" /> Download Video
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
