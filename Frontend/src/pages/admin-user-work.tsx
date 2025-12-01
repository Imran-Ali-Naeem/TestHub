import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  FileVideo, Download, Eye, Clock, Chrome, BarChart3, 
  Users, ArrowLeft, FlaskConical, CheckCircle2, XCircle,
  Search, Trash2, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUserManagement, User } from "@/lib/userManagementContext";

interface UserTestRun {
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

const initialMockUserWork: Record<number, UserTestRun[]> = {
  1: [
    {
      id: "admin-1",
      suite: "System Health Check",
      browser: "Chrome",
      status: "passed",
      date: "Nov 30, 2025",
      time: "08:00 AM",
      duration: "32s",
      scripts: [
        { name: "Check Database Connection", status: "passed" },
        { name: "Verify API Endpoints", status: "passed" },
        { name: "Test Authentication Flow", status: "passed" },
      ],
      artifacts: { screenshots: 5, videos: true, logs: true }
    },
    {
      id: "admin-2",
      suite: "Security Audit",
      browser: "Firefox",
      status: "passed",
      date: "Nov 29, 2025",
      time: "02:30 PM",
      duration: "58s",
      scripts: [
        { name: "SQL Injection Test", status: "passed" },
        { name: "XSS Prevention Check", status: "passed" },
        { name: "Session Management", status: "passed" },
      ],
      artifacts: { screenshots: 10, videos: true, logs: true }
    },
  ],
  2: [
    {
      id: "john-1",
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
      id: "john-2",
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
      id: "john-3",
      suite: "User Profile Update",
      browser: "Chrome",
      status: "passed",
      date: "Nov 28, 2025",
      time: "04:20 PM",
      duration: "28s",
      scripts: [
        { name: "Open Profile Settings", status: "passed" },
        { name: "Update Information", status: "passed" },
        { name: "Save Changes", status: "passed" },
      ],
      artifacts: { screenshots: 4, videos: false, logs: true }
    },
  ],
  3: [
    {
      id: "alice-1",
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
      id: "alice-2",
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
      id: "alice-3",
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
  ],
};

export default function AdminUserWork() {
  const { users } = useUserManagement();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserSearchQuery, setSelectedUserSearchQuery] = useState("");
  const [userWork, setUserWork] = useState<Record<number, UserTestRun[]>>(initialMockUserWork);
  
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [deleteTestDialogOpen, setDeleteTestDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<{ userId: number; testId: string } | null>(null);
  const [userToDeleteTests, setUserToDeleteTests] = useState<User | null>(null);

  const getUserWork = (userId: number): UserTestRun[] => {
    return userWork[userId] || [];
  };

  const getFilteredUserWork = (userId: number): UserTestRun[] => {
    const work = getUserWork(userId);
    if (!selectedUserSearchQuery.trim()) {
      return work;
    }
    return work.filter(test => 
      test.suite.toLowerCase().includes(selectedUserSearchQuery.toLowerCase())
    );
  };

  const getUserStats = (userId: number) => {
    const work = getUserWork(userId);
    const total = work.length;
    const passed = work.filter(w => w.status === "passed").length;
    const failed = work.filter(w => w.status === "failed").length;
    return { total, passed, failed };
  };

  const testerUsers = users.filter(u => u.role === "Tester");
  
  const filteredTesters = testerUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteAllTests = () => {
    if (userToDeleteTests) {
      setUserWork(prev => ({
        ...prev,
        [userToDeleteTests.id]: []
      }));
      setDeleteAllDialogOpen(false);
      setUserToDeleteTests(null);
      if (selectedUser && selectedUser.id === userToDeleteTests.id) {
        setSelectedUser(null);
      }
    }
  };

  const handleDeleteTest = () => {
    if (testToDelete) {
      setUserWork(prev => ({
        ...prev,
        [testToDelete.userId]: prev[testToDelete.userId]?.filter(t => t.id !== testToDelete.testId) || []
      }));
      setDeleteTestDialogOpen(false);
      setTestToDelete(null);
    }
  };

  const openDeleteAllDialog = (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setUserToDeleteTests(user);
    setDeleteAllDialogOpen(true);
  };

  const openDeleteTestDialog = (userId: number, testId: string) => {
    setTestToDelete({ userId, testId });
    setDeleteTestDialogOpen(true);
  };

  return (
    <Layout role="admin">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {selectedUser && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSelectedUser(null)}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-1">
              {selectedUser ? `${selectedUser.name}'s Work` : "User Work"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {selectedUser 
                ? `View all test executions by ${selectedUser.name}` 
                : "Select a user to view their test execution history"}
            </p>
          </div>
        </div>
        {!selectedUser && (
          <Badge className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30 text-sm px-3 py-1">
            <Users className="w-4 h-4 mr-2" />
            {testerUsers.length} Testers
          </Badge>
        )}
        {selectedUser && getUserWork(selectedUser.id).length > 0 && (
          <Button
            variant="outline"
            className="border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
            onClick={() => {
              setUserToDeleteTests(selectedUser);
              setDeleteAllDialogOpen(true);
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete All Tests
          </Button>
        )}
      </div>

      {!selectedUser ? (
        <GlassCard>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">All Testers</h2>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
              />
            </div>
          </div>

          <Table>
            <TableHeader className="border-slate-200 dark:border-white/10">
              <TableRow className="border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5">
                <TableHead className="text-slate-600 dark:text-slate-400">Tester</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400 text-center">Total Tests</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400 text-center">Passed</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400 text-center">Failed</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Status</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Last Active</TableHead>
                <TableHead className="text-right text-slate-600 dark:text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTesters.map((user) => {
                const stats = getUserStats(user.id);
                return (
                  <TableRow 
                    key={user.id} 
                    className="border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => setSelectedUser(user)}
                  >
                    <TableCell className="font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-purple-500/30">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold text-slate-900 dark:text-white">{stats.total}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold text-green-600 dark:text-green-400">{stats.passed}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold text-red-600 dark:text-red-400">{stats.failed}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${
                        user.status === 'Active' 
                          ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' 
                          : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'
                      } border`}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400 text-sm">{user.lastActive}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                        {stats.total > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10"
                            onClick={(e) => openDeleteAllDialog(user, e)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Delete All
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredTesters.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {searchQuery ? "No Testers Found" : "No Testers Yet"}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {searchQuery 
                        ? `No testers match "${searchQuery}"` 
                        : "There are no tester users in the system yet."}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <GlassCard className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{getUserStats(selectedUser.id).total}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">Total Tests</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{getUserStats(selectedUser.id).passed}</p>
                  <p className="text-xs text-green-700 dark:text-green-300">Passed</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{getUserStats(selectedUser.id).failed}</p>
                  <p className="text-xs text-red-700 dark:text-red-300">Failed</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedUser.lastActive}</p>
                  <p className="text-xs text-purple-700 dark:text-purple-300">Last Active</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {getUserWork(selectedUser.id).length > 0 ? (
            <>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Test Suites</h2>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by test suite name..."
                    value={selectedUserSearchQuery}
                    onChange={(e) => setSelectedUserSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
                  />
                </div>
              </div>
              {getFilteredUserWork(selectedUser.id).length > 0 ? (
                getFilteredUserWork(selectedUser.id).map((report) => (
                  <GlassCard key={report.id} className="group hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
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
                          onClick={() => openDeleteTestDialog(selectedUser.id, report.id)}
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
                ))
              ) : (
                <GlassCard className="text-center py-12">
                  <BarChart3 className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Test Suites Found</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {selectedUserSearchQuery ? `No test suites match "${selectedUserSearchQuery}"` : "This user hasn't run any tests yet."}
                  </p>
                </GlassCard>
              )}
            </>
          ) : (
            <GlassCard className="text-center py-12">
              <BarChart3 className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Test Executions</h3>
              <p className="text-slate-600 dark:text-slate-400">This user hasn't run any tests yet.</p>
            </GlassCard>
          )}
        </div>
      )}

      <Dialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl border-slate-200 dark:border-white/10 text-slate-900 dark:text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete All Test Cases
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete all test cases for <strong className="text-slate-900 dark:text-white">{userToDeleteTests?.name}</strong>? This action cannot be undone.
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
              onClick={handleDeleteAllTests}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete All
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
    </Layout>
  );
}
