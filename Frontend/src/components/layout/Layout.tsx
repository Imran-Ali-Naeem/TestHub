import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Shield, 
  Users, 
  LogOut,
  Menu,
  Zap,
  History,
  User,
  Briefcase
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { ParticleBackground } from "@/components/particle-background";
import { useUser } from "@/lib/userContext";
import { useAuth } from "@/lib/authContext";

const SidebarItem = ({ href, icon: Icon, label, isActive }: { href: string; icon: any; label: string; isActive: boolean }) => (
  <Link href={href}>
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer group",
      isActive 
        ? "bg-primary/20 text-primary border border-primary/20 shadow-[0_0_10px_rgba(37,99,235,0.2)] dark:shadow-[0_0_10px_rgba(37,99,235,0.2)]" 
        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
    )}>
      <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "group-hover:text-slate-900 dark:group-hover:text-white")} />
      <span className="font-medium font-sans">{label}</span>
      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]" />}
    </div>
  </Link>
);

type NavItem = {
  href: string;
  icon: React.ElementType;
  label: string;
};

export default function Layout({ children, role = "user" }: { children: React.ReactNode; role?: "user" | "admin" }) {
  const [location, setLocation] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { profile, logout: userLogout } = useUser();
  const { logout: authLogout } = useAuth();

  const handleSignOut = () => {
    // Logout from both contexts
    authLogout();  // Clears JWT token
    userLogout();  // Clears user profile
    setLocation("/");
  };

  const navItems: NavItem[] = [];

  if (role === "admin") {
    navItems.push({ href: "/admin", icon: LayoutDashboard, label: "Admin Dashboard" });
    navItems.push({ href: "/users", icon: Users, label: "User Management" });
    navItems.push({ href: "/admin/create", icon: Zap, label: "Create Test Suite" });
    navItems.push({ href: "/admin/history", icon: History, label: "History" });
    navItems.push({ href: "/admin/user-work", icon: Briefcase, label: "User Work" });
  } else {
    navItems.push({ href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" });
    navItems.push({ href: "/create", icon: Zap, label: "Create Test Suite" });
    navItems.push({ href: "/history", icon: History, label: "History" });
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold font-display tracking-wider text-slate-900 dark:text-white">
            TESTHUB
          </span>
        </div>
        
        <div className="space-y-1">
          {navItems.map((item) => (
            <SidebarItem 
              key={item.href} 
              {...item} 
              isActive={location === item.href}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto p-6 border-t border-slate-200 dark:border-white/5">
        <Link href="/profile">
          <div className="flex items-center gap-3 mb-4 px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            {profile.avatarType === "image" && profile.avatar ? (
              <img 
                src={profile.avatar} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: profile.avatar || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
              >
                <User className="w-4 h-4 text-white/80" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{profile.username}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 capitalize">{profile.role || role}</p>
            </div>
          </div>
        </Link>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex overflow-hidden relative transition-colors">
      <ParticleBackground />
      <aside className="hidden md:block w-64 border-r border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 backdrop-blur-xl fixed inset-y-0 left-0 z-20 transition-colors">
        <SidebarContent />
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg z-30 flex items-center justify-between px-4 transition-colors">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-lg text-slate-900 dark:text-white">TESTHUB</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-slate-50 dark:bg-slate-900/95 border-r border-slate-200 dark:border-white/10 w-64">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <main className="flex-1 md:ml-64 relative z-20 overflow-y-auto h-screen">
        <div className="absolute top-4 right-4 z-40 hidden md:flex">
          <ThemeToggle />
        </div>
        <div className="p-6 md:p-8 pt-20 md:pt-8 max-w-7xl mx-auto space-y-8 min-h-[calc(100vh-2rem)]">
          {children}
        </div>
      </main>

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 dark:opacity-10 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>
    </div>
  );
}
