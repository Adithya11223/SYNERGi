import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { 
   LayoutGrid, Briefcase, Users, Settings, 
   ChevronLeft, ChevronRight, Search, Building2,
  FileUser, CheckSquare, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn, getImageUrl } from "@/lib/utils";
import { pageTransitionVariants } from "@/lib/animations";
// import GlobalChatBubble from "@/components/chat/GlobalChatBubble";
import MobileBottomNav from "./MobileBottomNav";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { GlobalCommandPalette } from "@/components/search/GlobalCommandPalette";
import { useSearchStore } from "@/store/useSearchStore";


interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
  
  const user = useAuthStore(state => state.user);
  const location = useLocation();

  const isFounder = user?.role === 'FOUNDER';

  const founderLinks = [
    { name: "Dashboard", href: "/founder/dashboard", icon: LayoutGrid },
    { name: "My Startups", href: "/founder/startups", icon: Building2 },
    { name: "Browse", href: "/founder/browse", icon: Search },
    { name: "Job Offered", href: "/founder/job-offers", icon: Briefcase },
    { name: "Applications", href: "/founder/applications", icon: FileUser },
    { name: "Collaboration", href: "/founder/collaboration", icon: Users },
    { name: "To-Do List", href: "/founder/todo", icon: CheckSquare },
    { name: "Notes", href: "/founder/notes", icon: FileText },
  ];

  const talentLinks = [
    { name: "Dashboard", href: "/talent/dashboard", icon: LayoutGrid },
    { name: "Browse", href: "/talent/browse", icon: Search },
    { name: "Job Offers", href: "/talent/job-offers", icon: Briefcase },
    { name: "My Applications", href: "/talent/applications", icon: FileUser },
    { name: "Collaboration", href: "/talent/collaboration", icon: Users },
    { name: "To-Do List", href: "/talent/todo", icon: CheckSquare },
    { name: "Notes", href: "/talent/notes", icon: FileText },
  ];

  const navLinks = isFounder ? founderLinks : talentLinks;
  
  let currentTitle = navLinks.find(link => location.pathname === link.href)?.name;
  if (!currentTitle) {
    if (location.pathname.includes('/profile')) currentTitle = 'Profile';
    else if (location.pathname.includes('/settings')) currentTitle = 'Settings';
    else if (location.pathname.includes('/bookmarks')) currentTitle = 'Bookmarks';
    else if (location.pathname.includes('/todo')) currentTitle = 'To-Do List';
    else if (location.pathname.includes('/notes')) currentTitle = 'Notes';
    else currentTitle = 'Dashboard';
  }

  return (
    <div className="min-h-[100dvh] flex bg-transparent pt-safe pb-safe pl-safe pr-safe">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col glass-surface shadow-sm transition-all duration-500 ease-[var(--ease-spring)] relative z-20 m-6 mr-2 mb-6 border border-border rounded-2xl shrink-0",
        isCollapsed ? "w-24" : "w-72"
      )}>
        <div className="h-24 flex items-center justify-between px-6 border-b border-black/5 dark:border-white/10">
          {!isCollapsed && <img src="/synergi-logo.png" alt="SYNERGi" className="h-14 w-auto object-contain py-1.5 -ml-1" />}
          {isCollapsed && <img src="/synergi-icon.png" alt="S" className="h-10 w-10 mx-auto rounded-xl object-contain" />}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex absolute -right-4 top-8 z-[100] h-8 w-8 rounded-full border border-[var(--glass-border)] glass-floating shadow-sm"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 no-scrollbar">
          <AnimatePresence>
            {navLinks.map((link, i) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 24 }}
                >
                  <Link
                    to={link.href}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-2xl interactive-glass-button",
                      isActive ? "bg-gradient-to-b from-primary/90 to-primary text-white font-semibold shadow-glow translate-x-1" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground hover:translate-x-1",
                      isCollapsed ? "justify-center" : ""
                    )}
                    title={isCollapsed ? link.name : undefined}
                  >
                    <Icon className={cn("h-5 w-5 transition-transform", isActive ? "text-white scale-110" : "group-hover:scale-110")} />
                    {!isCollapsed && <span className="text-[15px]">{link.name}</span>}
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </nav>
        <div className="p-6 border-t border-black/5 dark:border-white/10">
          <Link
            to={isFounder ? "/founder/settings" : "/talent/settings"}
            className={cn(
              "flex items-center gap-4 px-4 py-3 rounded-2xl interactive-glass-button w-full",
              location.pathname === (isFounder ? "/founder/settings" : "/talent/settings") ? "bg-gradient-to-b from-primary/90 to-primary text-white font-semibold shadow-glow translate-x-1" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground hover:translate-x-1",
              isCollapsed ? "justify-center" : "justify-start"
            )}
            title={isCollapsed ? "Settings" : undefined}
          >
            <Settings className={cn("h-5 w-5 transition-transform", location.pathname === (isFounder ? "/founder/settings" : "/talent/settings") ? "text-white scale-110" : "group-hover:scale-110")} />
            {!isCollapsed && <span className="text-[15px] ml-1 font-medium">Settings</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden relative">
        {/* Top Navbar */}
        <header className="absolute top-0 left-0 right-0 h-16 md:h-20 glass-surface flex items-center justify-between px-4 sm:px-6 md:px-8 z-50 m-4 mb-2 md:m-6 md:mt-6 md:mb-4 rounded-[var(--radius)] md:rounded-2xl border border-[var(--glass-border)] shrink-0 bg-white/70 dark:bg-[#0c1222]/80 backdrop-blur-[40px] backdrop-saturate-[1.5] shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {/* Mobile Header Layout */}
          <div className="flex md:hidden items-center justify-between w-full">
            <NotificationBell />
            <Link to={isFounder ? '/founder/profile' : '/talent/profile'}>
              <Avatar className="h-9 w-9 border-2 border-black/5 dark:border-white/10 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                <AvatarImage src={getImageUrl(user?.profileImage)} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {(user?.fullName || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>

          {/* Desktop Header Layout */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{currentTitle}</h1>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => useSearchStore.getState().setIsOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground mr-2 group"
            >
              <Search className="w-4 h-4 group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium mr-4">Search...</span>
              <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-black/5 dark:bg-white/10">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
            <NotificationBell />
            <Link to={isFounder ? '/founder/profile' : '/talent/profile'} className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold leading-none text-foreground">{user?.fullName || 'User'}</p>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium">{isFounder ? 'Founder' : 'Talent'}</p>
              </div>
              <Avatar className="h-11 w-11 border-2 border-black/5 dark:border-white/10 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                <AvatarImage src={getImageUrl(user?.profileImage)} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {(user?.fullName || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main 
          className="flex-1 overflow-y-auto relative w-full h-full m-0 md:m-6 mt-0 md:mt-0 mb-0 md:mb-6 rounded-none md:rounded-[var(--radius)] bg-transparent pt-24 md:pt-32 px-4 sm:px-6 md:px-8 no-scrollbar pb-24 md:pb-8"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0px, transparent 24px, black 100px, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, transparent 24px, black 100px, black 100%)'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <GlobalCommandPalette />
      <div className="transition-all duration-500 ease-[var(--ease-spring)]">
        <MobileBottomNav />
      </div>
    </div>
  );
}

