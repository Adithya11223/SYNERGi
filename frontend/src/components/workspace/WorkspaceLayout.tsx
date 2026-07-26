import { Outlet, useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Users, MessageSquare, Video, Settings, ArrowLeft, LayoutDashboard, Megaphone, ChevronLeft, ChevronRight, Phone } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getImageUrl, cn } from '@/lib/utils';
import { workspaceService } from "@/services/workspaceService";
import type { WorkspaceResponse } from "@/services/workspaceService";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { pageTransitionVariants } from "@/lib/animations";

export default function WorkspaceLayout() {
  const { id, roomId } = useParams<{ id: string, roomId?: string }>();
  const user = useAuthStore(state => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadWorkspace = async () => {
      try {
        const workspaces = await workspaceService.getMyWorkspaces();
        const current = workspaces.find(w => w.startupUuid === id);
        if (current) {
          setWorkspace(current);
        } else {
          toast.error("Unauthorized to access this workspace.");
          navigate(user?.role === 'FOUNDER' ? '/founder/collaboration' : '/talent/collaboration', { replace: true });
        }
      } catch (err) {
        toast.error(`Failed to load workspace details: ${err instanceof Error ? err.message : String(err)}`);
        navigate(user?.role === 'FOUNDER' ? '/founder/collaboration' : '/talent/collaboration', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    loadWorkspace();
  }, [id, navigate, user]);

  useEffect(() => {
    const handleMinimize = () => setIsSidebarMinimized(true);
    const handleExpand = () => setIsSidebarMinimized(false);
    window.addEventListener('minimize-workspace-sidebar', handleMinimize);
    window.addEventListener('expand-workspace-sidebar', handleExpand);
    return () => {
      window.removeEventListener('minimize-workspace-sidebar', handleMinimize);
      window.removeEventListener('expand-workspace-sidebar', handleExpand);
    };
  }, []);

  if (loading) {
    return <div className="p-20 flex justify-center"><Skeleton className="h-[600px] w-full max-w-4xl rounded-2xl" /></div>;
  }

  if (!workspace) return null;

  const basePath = user?.role === 'FOUNDER' ? `/founder/workspace/${id}` : `/talent/workspace/${id}`;
  const backPath = location.state?.from || (user?.role === 'FOUNDER' ? '/founder/collaboration' : '/talent/collaboration');

  const navItems = [
    { name: "Overview", path: "", icon: LayoutDashboard },
    { name: "Members", path: "/members", icon: Users },
    { name: "Team Chat", path: "/chat", icon: MessageSquare },
    { name: "Meetings", path: "/meetings", icon: Video },
    { name: "Calls", path: "/calls", icon: Phone },
    { name: "Announcements", path: "/announcements", icon: Megaphone },
    ...(user?.role === 'FOUNDER' ? [{ name: "Settings", path: "/settings", icon: Settings }] : []),
  ];

  const isChatRoute = location.pathname.includes('/chat');

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row h-[100dvh] bg-transparent overflow-hidden pt-safe pb-safe pl-safe pr-safe">

      {/* Workspace Sidebar / Topbar */}
      <div className={`glass-surface flex-col flex-shrink-0 m-4 lg:m-6 lg:mr-2 lg:mb-6 rounded-[var(--radius)] border border-[var(--glass-border)] max-h-[50vh] lg:max-h-none transition-all duration-500 ease-[var(--ease-spring)] absolute lg:relative top-0 left-0 right-0 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] lg:shadow-sm bg-white/70 dark:bg-[#0c1222]/80 lg:!bg-transparent backdrop-blur-[40px] backdrop-saturate-[1.5] lg:backdrop-filter-none ${isSidebarMinimized ? 'lg:w-[88px]' : 'lg:max-w-72'} ${roomId ? 'hidden lg:flex' : 'flex'}`}>

        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
          className="hidden lg:flex absolute -right-3.5 top-24 z-[100] w-7 h-7 glass-floating text-foreground shadow-[var(--shadow-glass-md)] rounded-full items-center justify-center hover:scale-105 transition-transform border border-[var(--glass-border)]"
        >
          {isSidebarMinimized ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className="flex flex-col h-full w-full rounded-[var(--radius)] overflow-hidden">
          {/* Header */}
          <div className={`h-16 lg:h-24 lg:border-b border-black/5 dark:border-white/10 flex items-center px-4 gap-3 lg:gap-4 shrink-0 bg-transparent lg:bg-background/50 lg:backdrop-blur-md ${isSidebarMinimized ? 'lg:px-0 lg:justify-center' : 'lg:px-6'}`}>
            <Link to={backPath} className="shrink-0">
              <Button variant="ghost" size="icon" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 border border-black/5 dark:border-white/10 glass-surface shadow-sm"><ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" /></Button>
            </Link>
            <div className={`flex-1 min-w-0 ${isSidebarMinimized ? 'lg:hidden' : ''}`}>
              <h3 className="font-bold text-base lg:text-lg truncate text-foreground">{workspace.startupName}</h3>
              <p className="text-xs lg:text-sm font-medium text-primary truncate capitalize">
                <span className="lg:hidden">{location.pathname.replace(basePath, '').replace('/', '') || 'Overview'}</span>
                <span className="hidden lg:inline">Workspace</span>
              </p>
            </div>
            {/* User context on mobile */}
            <div className="lg:hidden shrink-0 flex-none w-10 h-10 flex items-center justify-center bg-primary/20 p-0.5 rounded-full border border-primary/30 shadow-[0_0_10px_rgba(56,103,255,0.3)] aspect-square overflow-hidden">
              <img src={getImageUrl(user?.profileImage) || `https://ui-avatars.com/api/?name=${user?.fullName}`} alt="Avatar" className="w-full h-full shrink-0 aspect-square rounded-full object-cover bg-white" />
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden lg:flex overflow-y-auto overflow-x-hidden p-4 m-0 flex-col gap-2 flex-1 no-scrollbar bg-transparent rounded-none border-none shadow-none">
            {navItems.map((item) => {
              const fullPath = `${basePath}${item.path}`;
              const isActive = item.path === ""
                ? location.pathname === basePath
                : location.pathname.startsWith(fullPath);

              return (
                <Link key={item.name} to={fullPath} className={`shrink-0 w-full ${isSidebarMinimized ? 'lg:w-auto' : ''}`}>
                  <div className={`flex items-center justify-start gap-4 px-6 py-3 rounded-2xl text-[15px] font-semibold transition-all duration-300 whitespace-nowrap ${isActive ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)] backdrop-blur-md translate-x-1" : "text-muted-foreground hover:text-foreground hover:glass hover:translate-x-1"
                    } ${isSidebarMinimized ? 'lg:justify-center lg:px-0 lg:mx-2 lg:translate-x-0' : ''}`}>
                    <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary-foreground' : ''}`} />
                    <span className={`${isSidebarMinimized ? 'lg:hidden' : ''}`}>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* User context (Desktop) */}
          <div className={`hidden lg:flex p-6 border-t border-black/5 dark:border-white/10 shrink-0 ${isSidebarMinimized ? 'justify-center px-0' : 'items-center gap-4'}`}>
            <img src={getImageUrl(user?.profileImage) || `https://ui-avatars.com/api/?name=${user?.fullName}`} alt="Avatar" className={`w-10 h-10 shrink-0 aspect-square rounded-full object-cover bg-white border border-black/5 dark:border-white/10 shadow-sm`} />
            {!isSidebarMinimized && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate text-foreground">{user?.fullName}</p>
                <p className="text-xs font-medium text-muted-foreground capitalize truncate">{workspace.userRole.replace('_', ' ').toLowerCase()}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {!isChatRoute && (
          <div className="hidden lg:flex absolute top-0 left-0 right-0 h-20 glass-surface shadow-sm items-center justify-between px-6 xl:px-8 shrink-0 m-6 mt-6 mb-4 rounded-2xl z-50 border border-border">
            <h2 className="text-2xl font-bold tracking-tight capitalize text-foreground truncate pr-4">
              {location.pathname.replace(basePath, '').replace('/', '') || 'Overview'}
            </h2>
            <div className="flex items-center gap-4 shrink-0">
              <Link to={user?.role === 'FOUNDER' ? `/founder/startups/${id}/edit` : `/talent/startups/${id}`}>
                <Button variant="outline" size="sm" className="hidden sm:flex border-primary/20 text-primary hover:bg-primary/10">
                  {user?.role === 'FOUNDER' ? 'Edit Startup' : 'View Public Page'}
                </Button>
              </Link>
            </div>
          </div>
        )}
        <div
          className={`flex-1 ${isChatRoute ? 'overflow-hidden' : 'overflow-y-auto'} w-full h-full m-0 ${isChatRoute ? 'lg:m-6 lg:ml-2' : 'lg:m-6 lg:mt-0 lg:mb-6'} ${isChatRoute ? 'p-0' : 'p-4 pt-24 sm:p-6 sm:pt-24 lg:p-6 lg:pt-[112px]'} rounded-[var(--radius)] bg-transparent relative no-scrollbar ${roomId ? 'pb-0' : 'pb-24 lg:pb-0'}`}
          style={{
            maskImage: !isChatRoute ? 'linear-gradient(to bottom, transparent 0px, transparent 24px, black 100px, black 100%)' : 'none',
            WebkitMaskImage: !isChatRoute ? 'linear-gradient(to bottom, transparent 0px, transparent 24px, black 100px, black 100%)' : 'none'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full w-full flex flex-col"
            >
              <Outlet context={{ workspace }} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Subtle fade layer behind nav to obscure content */}
      <div className={`fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0c1222]/80 dark:from-[#0a0f1d]/90 to-transparent pointer-events-none z-40 lg:hidden ${roomId ? 'hidden' : 'block'}`} />

      {/* Mobile Bottom Navigation for Workspace */}
      <div className={`fixed bottom-2 left-4 right-4 z-[100] lg:hidden pb-safe ${roomId ? 'hidden' : 'block'}`}>
        {/* Outer 3D Glass Container */}
        <div className="bg-white/70 dark:bg-[#0c1222]/80 backdrop-blur-[40px] backdrop-saturate-[1.5] border border-white/50 dark:border-white/10 dark:border-t-white/20 dark:border-b-black/80 rounded-[var(--radius)] shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="flex items-center justify-start overflow-x-auto no-scrollbar p-2 h-[72px] gap-2">
            {navItems.map((item) => {
              const fullPath = `${basePath}${item.path}`;
              const isActive = item.path === ""
                ? location.pathname === basePath
                : location.pathname.startsWith(fullPath);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={fullPath}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[88px] px-2 flex-shrink-0 h-[56px] rounded-[var(--radius-sm)] transition-all duration-300 group relative",
                    isActive ? "text-primary" : "text-slate-500 hover:text-slate-800 dark:text-white/60 dark:hover:text-white"
                  )}
                >
                  {/* Thick Active Glass Pill (Bevel effect) */}
                  {isActive && (
                    <motion.div
                      layoutId="workspaceNavActiveIndicator"
                      className="absolute inset-0 bg-white/40 dark:bg-white/10 backdrop-blur-md backdrop-saturate-[1.2] border border-white/60 dark:border-white/10 dark:border-t-white/30 dark:border-b-black/90 rounded-[var(--radius-sm)] shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)] pointer-events-none"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "w-[22px] h-[22px] mb-1 transition-all duration-300 relative z-10",
                      isActive ? "fill-current drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "group-hover:scale-110"
                    )}
                  />
                  <span className={cn(
                    "text-[12px] font-medium tracking-wide relative z-10",
                    isActive && "drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                  )}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
