import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  LayoutGrid, Building2, Briefcase, Search, User as UserIcon, Settings, Users, FileUser, CheckSquare, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function MobileBottomNav() {
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
    { name: "Profile", href: "/founder/profile", icon: UserIcon },
    { name: "Settings", href: "/founder/settings", icon: Settings },
  ];

  const talentLinks = [
    { name: "Dashboard", href: "/talent/dashboard", icon: LayoutGrid },
    { name: "Browse", href: "/talent/browse", icon: Search },
    { name: "Job Offers", href: "/talent/job-offers", icon: Briefcase },
    { name: "My Applications", href: "/talent/applications", icon: FileUser },
    { name: "Collaboration", href: "/talent/collaboration", icon: Users },
    { name: "To-Do List", href: "/talent/todo", icon: CheckSquare },
    { name: "Notes", href: "/talent/notes", icon: FileText },
    { name: "Profile", href: "/talent/profile", icon: UserIcon },
    { name: "Settings", href: "/talent/settings", icon: Settings },
  ];

  const links = isFounder ? founderLinks : talentLinks;

  return (
    <>
      {/* Subtle fade layer behind nav to obscure content */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0c1222]/80 dark:from-[#0a0f1d]/90 to-transparent pointer-events-none z-40 md:hidden" />
      
      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden pb-safe">
      {/* Outer 3D Glass Container */}
      <div className="bg-white/70 dark:bg-[#0c1222]/80 backdrop-blur-[40px] backdrop-saturate-[1.5] border border-white/50 dark:border-white/10 dark:border-t-white/20 dark:border-b-black/80 rounded-[var(--radius)] shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="flex items-center justify-start overflow-x-auto no-scrollbar px-2 h-16 gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.includes(link.href);
                             
            return (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[88px] px-2 flex-shrink-0 h-[52px] rounded-[var(--radius-sm)] transition-all duration-300 group relative",
                  isActive ? "text-primary" : "text-slate-500 hover:text-slate-800 dark:text-white/60 dark:hover:text-white"
                )}
              >
                {/* Thick Active Glass Pill (Bevel effect) */}
                {isActive && (
                  <motion.div
                    layoutId="mobileNavActiveIndicator"
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
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}
