import { memo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, Users, Eye, MapPin, Briefcase, ChevronRight, Globe, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { ExploreStartupResponse } from "@/services/talentStartupService";
import { getImageUrl } from "@/lib/utils";

import { talentStartupService } from "@/services/talentStartupService";
import { toast } from "sonner";

interface PublicStartupCardProps {
  startup: ExploreStartupResponse;
  onBookmarkToggle?: (uuid: string, isBookmarked: boolean) => void;
}

export const PublicStartupCard = memo(function PublicStartupCard({ startup, onBookmarkToggle }: PublicStartupCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(startup.isBookmarkedByMe);
  const [bookmarking, setBookmarking] = useState(false);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (bookmarking) return;
    setBookmarking(true);
    
    try {
      if (isBookmarked) {
        await talentStartupService.unbookmarkStartup(startup.uuid);
        setIsBookmarked(false);
        toast.success("Removed from bookmarks");
      } else {
        await talentStartupService.bookmarkStartup(startup.uuid);
        setIsBookmarked(true);
        toast.success("Startup bookmarked!");
      }
      if (onBookmarkToggle) {
        onBookmarkToggle(startup.uuid, !isBookmarked);
      }
    } catch {
      toast.error("Failed to update bookmark");
    } finally {
      setBookmarking(false);
    }
  };

  return (
    <Link to={`/talent/startups/${startup.uuid}`}>
      <div className="glass-surface rounded-3xl overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-[var(--glass-border)] hover:border-primary/50 relative">
        {/* Cover Image & Bookmark */}
        <div className="relative h-20 sm:h-32 bg-muted w-full overflow-hidden shrink-0">
          {startup.coverUrl ? (
            <img src={getImageUrl(startup.coverUrl)} alt="Cover" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/5 to-background" />
          )}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-col gap-1 sm:gap-2">
            {startup.applicationsOpen === false ? (
              <Badge variant="destructive" className="font-semibold shadow-sm text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0 sm:py-0.5 border-none">
                Applications Closed
              </Badge>
            ) : startup.availableSlots !== undefined ? (
              <Badge className="bg-green-500 hover:bg-green-600 text-white font-semibold shadow-sm text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0 sm:py-0.5 border-none">
                {startup.availableSlots} Slot{startup.availableSlots === 1 ? '' : 's'} Left
              </Badge>
            ) : null}
          </div>

          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
            <Button 
              variant="secondary" 
              size="icon" 
              className={`h-7 w-7 sm:h-9 sm:w-9 rounded-full backdrop-blur shadow-sm transition-colors ${isBookmarked ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-transparent hover:bg-transparent'}`}
              onClick={handleBookmark}
              disabled={bookmarking}
            >
              <Bookmark className={`h-3 w-3 sm:h-4 sm:w-4 ${isBookmarked ? 'fill-primary' : ''}`} />
            </Button>
          </div>
          
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-10 flex gap-2">
            {startup.stage && (
              <Badge variant="secondary" className="bg-transparent backdrop-blur font-medium shadow-sm text-[8px] sm:text-xs px-1.5 py-0 sm:px-2 sm:py-0.5">
                {startup.stage.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-5 pt-0 sm:pt-0 flex-1 flex flex-col relative z-0">
          {/* Logo & Founder */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end -mt-6 sm:-mt-8 relative z-10 shrink-0 mb-2 sm:mb-3">
            <div className="h-10 w-10 sm:h-16 sm:w-16 rounded-xl border-2 sm:border-4 border-background glass-card shadow-sm flex items-center justify-center overflow-hidden mb-1 sm:mb-0">
              {startup.logoUrl ? (
                <img src={getImageUrl(startup.logoUrl)} alt="Logo" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              ) : (
                <Globe className="h-4 w-4 sm:h-6 sm:w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <span className="text-[9px] sm:text-xs text-muted-foreground flex items-center">
                By <span className="font-medium text-foreground ml-1 truncate max-w-[60px] sm:max-w-none">{startup.founderName}</span>
                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary ml-1" />
              </span>
            </div>
          </div>

          <div className="mb-2 sm:mb-4">
            <h3 className="font-bold text-sm sm:text-xl line-clamp-1 group-hover:text-primary transition-colors leading-tight" title={startup.name}>
              {startup.name}
            </h3>
            {startup.industry && (
              <span className="text-[8px] sm:text-xs font-medium text-primary uppercase tracking-wider">{startup.industry}</span>
            )}
            <p className="text-[10px] sm:text-sm text-muted-foreground line-clamp-2 mt-1 sm:mt-2 min-h-[30px] sm:min-h-[40px] leading-tight sm:leading-normal">
              {startup.tagline || startup.pitch || "No tagline provided."}
            </p>
          </div>

          {/* Roles & Info */}
          <div className="mt-auto space-y-2 sm:space-y-4">
            {startup.roles && startup.roles.length > 0 && (
              <div>
                <p className="text-[9px] sm:text-xs font-medium text-muted-foreground mb-1 sm:mb-2 flex items-center"><Briefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1"/> Looking for</p>
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {startup.roles.slice(0, 2).map(role => (
                    <Badge key={role} variant="outline" className="bg-primary/5 text-[8px] sm:text-xs font-normal border-primary/20 px-1.5 sm:px-2.5 py-0">
                      {role}
                    </Badge>
                  ))}
                  {startup.roles.length > 2 && (
                    <Badge variant="outline" className="text-[8px] sm:text-xs font-normal px-1 sm:px-2 py-0">+{startup.roles.length - 2}</Badge>
                  )}
                </div>
              </div>
            )}
            
            {startup.skills && startup.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {startup.skills.slice(0, 3).map(skill => (
                  <Badge key={skill} variant="secondary" className="text-[8px] sm:text-[10px] font-normal px-1 sm:px-1.5 py-0 hidden sm:inline-flex">
                    {skill}
                  </Badge>
                ))}
                {startup.skills.slice(0, 2).map(skill => (
                  <Badge key={skill} variant="secondary" className="text-[8px] font-normal px-1 py-0 sm:hidden">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[var(--glass-border)] bg-black/5 dark:bg-white/5 p-2 sm:p-4 shrink-0 flex flex-col gap-2 sm:gap-3">
          <div className="flex items-center justify-between w-full text-[9px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-1 sm:gap-3">
              {startup.workType && (
                <span className="flex items-center gap-0.5 sm:gap-1"><MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3"/> <span className="truncate max-w-[40px] sm:max-w-none">{startup.workType}</span></span>
              )}
              {startup.teamSize && (
                <span className="flex items-center gap-0.5 sm:gap-1 hidden sm:flex"><Users className="w-2.5 h-2.5 sm:w-3 sm:h-3"/> {startup.teamSize}</span>
              )}
            </div>
            <span className="flex items-center gap-0.5 sm:gap-1"><Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3"/> {startup.views} <span className="hidden sm:inline">views</span></span>
          </div>
          <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors h-7 sm:h-10 text-[10px] sm:text-sm" variant="outline">
            View Startup <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </Link>
  );
});
