import Layout from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Play, Chrome, FileCode, X } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface UploadedFile {
  name: string;
  size: string;
  type: string;
}

export default function AdminCreateSuite() {
  const [selectedBrowsers, setSelectedBrowsers] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    { name: "login_test.py", size: "2.4 KB", type: "Python" },
    { name: "checkout_flow.js", size: "3.1 KB", type: "JavaScript" },
    { name: "user_registration.java", size: "4.8 KB", type: "Java" },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleBrowser = (browser: string) => {
    setSelectedBrowsers(prev => 
      prev.includes(browser) 
        ? prev.filter(b => b !== browser)
        : [...prev, browser]
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map(file => ({
        name: file.name,
        size: formatFileSize(file.size),
        type: getFileType(file.name),
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileType = (fileName: string): string => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "py") return "Python";
    if (ext === "js") return "JavaScript";
    if (ext === "java") return "Java";
    return "Script";
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Layout role="admin">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-1">Create Test Suite</h1>
          <p className="text-slate-600 dark:text-slate-400">Set up a new automated testing configuration.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Suite Configuration</h3>
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="suite-name" className="text-slate-900 dark:text-white">Suite Name</Label>
                <Input 
                  id="suite-name"
                  placeholder="e.g., Login & Checkout Flow" 
                  className="bg-slate-50 dark:bg-slate-950/50 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500"
                />
                <p className="text-xs text-slate-600 dark:text-slate-500">A unique name for your test suite</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website-url" className="text-slate-900 dark:text-white">Website URL (Base URL)</Label>
                <Input 
                  id="website-url"
                  placeholder="e.g., https://www.example.com" 
                  className="bg-slate-50 dark:bg-slate-950/50 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500"
                />
                <p className="text-xs text-slate-600 dark:text-slate-500">The target website to test against</p>
              </div>
            </form>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Select Browsers</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-lg border border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => toggleBrowser("chrome")}>
                <Checkbox 
                  checked={selectedBrowsers.includes("chrome")}
                  onCheckedChange={() => toggleBrowser("chrome")}
                  className="cursor-pointer"
                />
                <div className="flex items-center gap-2 flex-1">
                  <Chrome className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Chrome</p>
                    <p className="text-xs text-slate-600 dark:text-slate-500">Latest version</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg border border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => toggleBrowser("firefox")}>
                <Checkbox 
                  checked={selectedBrowsers.includes("firefox")}
                  onCheckedChange={() => toggleBrowser("firefox")}
                  className="cursor-pointer"
                />
                <div className="flex items-center gap-2 flex-1">
                  <Chrome className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Firefox</p>
                    <p className="text-xs text-slate-600 dark:text-slate-500">Latest version</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-500 mt-4">Selected: {selectedBrowsers.length === 0 ? "None" : selectedBrowsers.join(", ").toUpperCase()}</p>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Upload Test Scripts</h3>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".py,.js,.java"
              onChange={handleFileSelect}
              className="hidden"
              id="admin-script-upload"
            />
            <label
              htmlFor="admin-script-upload"
              className="block p-6 rounded-lg border-2 border-dashed border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-primary/50 dark:hover:border-primary/50 transition-all cursor-pointer group text-center"
            >
              <Upload className="w-8 h-8 mx-auto mb-3 text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Click to upload test scripts</p>
              <p className="text-xs text-slate-600 dark:text-slate-500">Select multiple files (.py, .js, .java)</p>
            </label>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Uploaded Files ({uploadedFiles.length})</p>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5">
                    <FileCode className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{file.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-500">{file.type} - {file.size}</p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-500 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-600 dark:text-slate-500 mt-4">Supported: Python, JavaScript, Java with Selenium actions</p>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="sticky top-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Execution Summary</h3>
            <div className="space-y-4 mb-6">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5">
                <p className="text-xs text-slate-600 dark:text-slate-500 mb-1">Browsers Selected</p>
                <p className="text-sm font-mono text-blue-600 dark:text-blue-400">
                  {selectedBrowsers.length === 0 ? "None selected" : selectedBrowsers.join(", ").toUpperCase()}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5">
                <p className="text-xs text-slate-600 dark:text-slate-500 mb-1">Test Scripts</p>
                <p className="text-sm font-mono text-blue-600 dark:text-blue-400">{uploadedFiles.length}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5">
                <p className="text-xs text-slate-600 dark:text-slate-500 mb-1">Parallel Executions</p>
                <p className="text-sm font-mono text-green-600 dark:text-green-400">
                  {selectedBrowsers.length * uploadedFiles.length || 0}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5">
                <p className="text-xs text-slate-600 dark:text-slate-500 mb-1">Est. Duration</p>
                <p className="text-sm font-mono text-purple-600 dark:text-purple-400">~2-5 min</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <NeonButton 
                className="w-full" 
                neonColor="cyan"
                disabled={selectedBrowsers.length === 0}
              >
                <Play className="w-4 h-4 mr-2" /> Run Test Suite
              </NeonButton>
              <Button variant="outline" className="w-full border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5">
                Save as Draft
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </Layout>
  );
}
