import Layout from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MoreVertical, Shield, UserPlus, Mail, Calendar, Activity, X, 
  Check, Clock, Trash2, Edit, Eye, EyeOff, FlaskConical, Search, Users
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserManagement, User, SignupRequest } from "@/lib/userManagementContext";

export default function UserManagement() {
  const { users, signupRequests, addUser, updateUser, deleteUser, approveSignupRequest, rejectSignupRequest } = useUserManagement();
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState<SignupRequest | null>(null);
  const [selectedRole, setSelectedRole] = useState<"Admin" | "Tester">("Tester");
  
  const [showPassword, setShowPassword] = useState(false);
  const [pendingSearchQuery, setPendingSearchQuery] = useState("");
  const [usersSearchQuery, setUsersSearchQuery] = useState("");
  
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Tester" as "Admin" | "Tester",
  });
  
  const [editUserForm, setEditUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Tester" as "Admin" | "Tester",
    status: "Active" as "Active" | "Inactive",
  });

  const pendingRequests = signupRequests.filter(r => r.status === "Pending");
  
  const filteredPendingRequests = pendingRequests.filter(request =>
    request.name.toLowerCase().includes(pendingSearchQuery.toLowerCase()) ||
    request.email.toLowerCase().includes(pendingSearchQuery.toLowerCase())
  );
  
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(usersSearchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(usersSearchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(usersSearchQuery.toLowerCase())
  );

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      name: newUserForm.name,
      email: newUserForm.email,
      password: newUserForm.password,
      role: newUserForm.role,
      status: "Active",
    });
    setNewUserForm({ name: "", email: "", password: "", role: "Tester" });
    setIsAddUserOpen(false);
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      updateUser(selectedUser.id, {
        name: editUserForm.name,
        email: editUserForm.email,
        password: editUserForm.password || selectedUser.password,
        role: editUserForm.role,
        status: editUserForm.status,
      });
      setIsEditUserOpen(false);
      setSelectedUser(null);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditUserForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      status: user.status,
    });
    setIsEditUserOpen(true);
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
      setUserToDelete(null);
      setIsDeleteConfirmOpen(false);
    }
  };

  const openApproveDialog = (request: SignupRequest) => {
    setRequestToApprove(request);
    setSelectedRole("Tester");
    setApproveDialogOpen(true);
  };

  const handleApproveRequest = () => {
    if (requestToApprove) {
      approveSignupRequest(requestToApprove.id, selectedRole);
      setApproveDialogOpen(false);
      setRequestToApprove(null);
    }
  };

  return (
    <Layout role="admin">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-1">User Management</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage users, roles, and access requests.</p>
        </div>
        <NeonButton neonColor="blue" onClick={() => setIsAddUserOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" /> Add User
        </NeonButton>
      </div>

      {pendingRequests.length > 0 && (
        <GlassCard className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Pending Requests</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">{pendingRequests.length} users waiting for approval</p>
              </div>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search requests..."
                value={pendingSearchQuery}
                onChange={(e) => setPendingSearchQuery(e.target.value)}
                className="pl-10 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            {filteredPendingRequests.length > 0 ? (
              filteredPendingRequests.map((request) => (
                <div 
                  key={request.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-slate-200 dark:border-white/10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.name}`} />
                      <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{request.name}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{request.email}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                        Requested {request.requestDate}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                      onClick={() => rejectSignupRequest(request.id)}
                    >
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => openApproveDialog(request)}
                    >
                      <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
                <p className="text-slate-600 dark:text-slate-400">
                  No pending requests match "{pendingSearchQuery}"
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">All Users</h2>
            <Badge className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30">
              {users.length} Users
            </Badge>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, or role..."
              value={usersSearchQuery}
              onChange={(e) => setUsersSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
            />
          </div>
        </div>
        
        <Table>
          <TableHeader className="border-slate-200 dark:border-white/10">
            <TableRow className="border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5">
              <TableHead className="text-slate-600 dark:text-slate-400">User</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-400">Role</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-400">Status</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-400">Last Active</TableHead>
              <TableHead className="text-right text-slate-600 dark:text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow 
                  key={user.id} 
                  className="border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => setSelectedUser(user)}
                >
                  <TableCell className="font-medium text-slate-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-slate-200 dark:border-white/10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      {user.role === "Admin" ? (
                        <Shield className="w-3.5 h-3.5 text-blue-500" />
                      ) : (
                        <FlaskConical className="w-3.5 h-3.5 text-purple-500" />
                      )}
                      {user.role}
                    </div>
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
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                            <MoreVertical className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
                          <DropdownMenuItem 
                            className="text-slate-700 dark:text-white focus:bg-slate-100 dark:focus:bg-white/10 cursor-pointer" 
                            onClick={() => setSelectedUser(user)}
                          >
                            <Activity className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-slate-700 dark:text-white focus:bg-slate-100 dark:focus:bg-white/10 cursor-pointer"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="w-4 h-4 mr-2" /> Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 cursor-pointer"
                            onClick={() => {
                              setUserToDelete(user);
                              setIsDeleteConfirmOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {usersSearchQuery ? "No Users Found" : "No Users Yet"}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {usersSearchQuery 
                      ? `No users match "${usersSearchQuery}"` 
                      : "There are no users in the system yet."}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </GlassCard>

      <Dialog open={!!selectedUser && !isEditUserOpen} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl border-slate-200 dark:border-white/10 text-slate-900 dark:text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">User Profile</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">View user details and information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="mt-4">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16 border-2 border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.name}`} />
                  <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{selectedUser.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`${
                      selectedUser.role === "Admin" 
                        ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30"
                        : "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30"
                    }`}>
                      {selectedUser.role === "Admin" ? <Shield className="w-3 h-3 mr-1" /> : <FlaskConical className="w-3 h-3 mr-1" />}
                      {selectedUser.role}
                    </Badge>
                    <Badge className={`${
                      selectedUser.status === "Active"
                        ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                    }`}>
                      {selectedUser.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-500">Email Address</p>
                    <p className="text-sm font-medium">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-500">Joined Date</p>
                    <p className="text-sm font-medium">{selectedUser.joinedDate}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center gap-3">
                  <Activity className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-500">Last Activity</p>
                    <p className="text-sm font-medium">{selectedUser.lastActive}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10" 
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </Button>
                <NeonButton className="flex-1" neonColor="blue" onClick={() => openEditDialog(selectedUser)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit User
                </NeonButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl border-slate-200 dark:border-white/10 text-slate-900 dark:text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Add New User</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">Create a new user account with credentials</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-700 dark:text-slate-300">Full Name</Label>
              <Input 
                value={newUserForm.name}
                onChange={(e) => setNewUserForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                className="mt-1.5 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
                required
              />
            </div>
            
            <div>
              <Label className="text-slate-700 dark:text-slate-300">Email Address</Label>
              <Input 
                type="email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
                className="mt-1.5 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
                required
              />
            </div>
            
            <div>
              <Label className="text-slate-700 dark:text-slate-300">Password</Label>
              <div className="relative mt-1.5">
                <Input 
                  type={showPassword ? "text" : "password"}
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Set a password"
                  className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <Label className="text-slate-700 dark:text-slate-300">Role</Label>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setNewUserForm(prev => ({ ...prev, role: "Tester" }))}
                  className={`flex-1 p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                    newUserForm.role === "Tester"
                      ? "bg-purple-100 dark:bg-purple-500/20 border-purple-300 dark:border-purple-500/50 text-purple-700 dark:text-purple-300"
                      : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                  }`}
                >
                  <FlaskConical className="w-4 h-4" /> Tester
                </button>
                <button
                  type="button"
                  onClick={() => setNewUserForm(prev => ({ ...prev, role: "Admin" }))}
                  className={`flex-1 p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                    newUserForm.role === "Admin"
                      ? "bg-blue-100 dark:bg-blue-500/20 border-blue-300 dark:border-blue-500/50 text-blue-700 dark:text-blue-300"
                      : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                  }`}
                >
                  <Shield className="w-4 h-4" /> Admin
                </button>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                type="button"
                className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10"
                onClick={() => setIsAddUserOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                <UserPlus className="w-4 h-4 mr-2" /> Add User
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl border-slate-200 dark:border-white/10 text-slate-900 dark:text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit User</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">Update user information and credentials</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-700 dark:text-slate-300">Full Name</Label>
              <Input 
                value={editUserForm.name}
                onChange={(e) => setEditUserForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                className="mt-1.5 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
                required
              />
            </div>
            
            <div>
              <Label className="text-slate-700 dark:text-slate-300">Email Address</Label>
              <Input 
                type="email"
                value={editUserForm.email}
                onChange={(e) => setEditUserForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
                className="mt-1.5 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"
                required
              />
            </div>
            
            <div>
              <Label className="text-slate-700 dark:text-slate-300">New Password (leave blank to keep current)</Label>
              <div className="relative mt-1.5">
                <Input 
                  type={showPassword ? "text" : "password"}
                  value={editUserForm.password}
                  onChange={(e) => setEditUserForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter new password"
                  className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <Label className="text-slate-700 dark:text-slate-300">Role</Label>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setEditUserForm(prev => ({ ...prev, role: "Tester" }))}
                  className={`flex-1 p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                    editUserForm.role === "Tester"
                      ? "bg-purple-100 dark:bg-purple-500/20 border-purple-300 dark:border-purple-500/50 text-purple-700 dark:text-purple-300"
                      : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                  }`}
                >
                  <FlaskConical className="w-4 h-4" /> Tester
                </button>
                <button
                  type="button"
                  onClick={() => setEditUserForm(prev => ({ ...prev, role: "Admin" }))}
                  className={`flex-1 p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                    editUserForm.role === "Admin"
                      ? "bg-blue-100 dark:bg-blue-500/20 border-blue-300 dark:border-blue-500/50 text-blue-700 dark:text-blue-300"
                      : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                  }`}
                >
                  <Shield className="w-4 h-4" /> Admin
                </button>
              </div>
            </div>
            
            <div>
              <Label className="text-slate-700 dark:text-slate-300">Status</Label>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setEditUserForm(prev => ({ ...prev, status: "Active" }))}
                  className={`flex-1 p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                    editUserForm.status === "Active"
                      ? "bg-green-100 dark:bg-green-500/20 border-green-300 dark:border-green-500/50 text-green-700 dark:text-green-300"
                      : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setEditUserForm(prev => ({ ...prev, status: "Inactive" }))}
                  className={`flex-1 p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                    editUserForm.status === "Inactive"
                      ? "bg-red-100 dark:bg-red-500/20 border-red-300 dark:border-red-500/50 text-red-700 dark:text-red-300"
                      : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                type="button"
                className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10"
                onClick={() => setIsEditUserOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                <Edit className="w-4 h-4 mr-2" /> Update User
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl border-slate-200 dark:border-white/10 text-slate-900 dark:text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-red-600 dark:text-red-400">Delete User</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{userToDelete?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button 
              className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteUser}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl border-slate-200 dark:border-white/10 text-slate-900 dark:text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Approve User Request</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Select a role for <strong className="text-slate-900 dark:text-white">{requestToApprove?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-700 dark:text-slate-300">Assign Role</Label>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole("Tester")}
                  className={`flex-1 p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                    selectedRole === "Tester"
                      ? "bg-purple-100 dark:bg-purple-500/20 border-purple-300 dark:border-purple-500/50 text-purple-700 dark:text-purple-300"
                      : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                  }`}
                >
                  <FlaskConical className="w-4 h-4" /> Tester
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("Admin")}
                  className={`flex-1 p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                    selectedRole === "Admin"
                      ? "bg-blue-100 dark:bg-blue-500/20 border-blue-300 dark:border-blue-500/50 text-blue-700 dark:text-blue-300"
                      : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                  }`}
                >
                  <Shield className="w-4 h-4" /> Admin
                </button>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                type="button"
                className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10"
                onClick={() => setApproveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={handleApproveRequest}
              >
                <Check className="w-4 h-4 mr-2" /> Approve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
