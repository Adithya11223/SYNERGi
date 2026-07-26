import { memo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, Users, FileText, CalendarDays, 
  CheckCircle2, Clock, ArchiveRestore, Globe
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { getImageUrl } from "@/lib/utils";

export interface StartupResponse {
  uuid: string;
  name: string;
  logoUrl?: string;
  coverUrl?: string;
  tagline?: string;
  pitch?: string;
  problemStatement?: string;
  solution?: string;
  vision?: string;
  mission?: string;
  detailedDescription?: string;
  targetAudience?: string;
  businessModel?: string;
  revenueModel?: string;
  currentProgress?: string;
  roadmap?: string;
  futureGoals?: string;
  industry?: string;
  stage?: string;
  teamSize?: string;
  expectedTeamSize?: string;
  timeline?: string;
  launchGoal?: string;
  commitmentType?: string;
  workType?: string;
  city?: string;
  equityAvailable?: string;
  equityPercentage?: string;
  roles?: string[];
  skills?: string[];
  attachments?: any[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  views: number;
  applicationsCount: number;
  teamMembersCount: number;
  maxMembers?: number;
  approvedMembers?: number;
  availableSlots?: number;
  applicationsOpen?: boolean;
}

interface StartupCardProps {
  startup: StartupResponse;
  onDelete: (uuid: string) => void;
  onArchive: (uuid: string) => void;
  onPublish: (uuid: string) => void;
}

export const StartupCard = memo(function StartupCard({ startup, onDelete, onArchive, onPublish }: StartupCardProps) {
  
  const statusColors = {
    DRAFT: "bg-muted text-muted-foreground",
    PUBLISHED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    ARCHIVED: "bg-orange-500/10 text-orange-600 border-orange-500/20"
  };

  const StatusIcon = {
    DRAFT: Clock,
    PUBLISHED: CheckCircle2,
    ARCHIVED: ArchiveRestore
  }[startup.status];

  return (
    <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col h-full border">
      {/* Cover Image & Dropdown */}
      <div className="relative h-20 sm:h-32 bg-muted w-full overflow-hidden shrink-0">
        {startup.coverUrl ? (
          <img src={getImageUrl(startup.coverUrl)} alt="Cover" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/5" />
        )}
        
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-transparent backdrop-blur shadow-sm hover:bg-transparent">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to={`/founder/startups/${startup.uuid}/edit`}>Edit Details</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/founder/applications?startupId=${startup.uuid}`}>View Applications</Link>
              </DropdownMenuItem>
              {startup.status === 'PUBLISHED' && (
                <DropdownMenuItem asChild>
                  <Link to={`/founder/workspace/${startup.uuid}`}>Open Workspace</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {startup.status !== 'PUBLISHED' && (
                <DropdownMenuItem onClick={() => onPublish(startup.uuid)}>Publish</DropdownMenuItem>
              )}
              {startup.status !== 'ARCHIVED' && (
                <DropdownMenuItem onClick={() => onArchive(startup.uuid)}>Archive</DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(startup.uuid)} className="text-destructive focus:bg-destructive/10">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="px-3 pt-0 pb-3 sm:p-5 sm:pt-0 flex-1 flex flex-col relative z-0">
        {/* Logo */}
        <div className="absolute -top-6 left-3 sm:-top-10 sm:left-6 h-12 w-12 sm:h-20 sm:w-20 rounded-full border-4 border-background bg-muted overflow-hidden flex items-center justify-center shrink-0 z-20 shadow-md">
          {startup.logoUrl ? (
            <img src={getImageUrl(startup.logoUrl)} alt="Logo" loading="lazy" decoding="async" className="w-full h-full object-cover" />
          ) : (
            <Globe className="h-4 w-4 sm:h-6 sm:w-6 text-muted-foreground" />
          )}
        </div>

        <div className="mt-8 sm:mt-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-1">
            <h3 className="font-semibold text-sm sm:text-lg line-clamp-1" title={startup.name}>{startup.name}</h3>
            <Badge variant="outline" className={`w-fit text-[8px] sm:text-xs px-1.5 py-0 sm:px-2.5 sm:py-0.5 h-4 sm:h-5 ${statusColors[startup.status]}`}>
              <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
              {startup.status}
            </Badge>
          </div>
          <p className="text-[10px] sm:text-sm text-muted-foreground line-clamp-2 min-h-[30px] sm:min-h-[40px] leading-tight sm:leading-normal">
            {startup.tagline || "No tagline provided."}
          </p>
        </div>

        <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-2 shrink-0">
          {startup.stage && <Badge variant="secondary" className="font-normal text-[8px] sm:text-xs w-fit">{startup.stage.replace('_', ' ')}</Badge>}
          <div className="text-[9px] sm:text-xs text-muted-foreground flex items-center gap-1 mt-1 w-full">
            <CalendarDays className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            Updated {formatDistanceToNow(new Date(startup.updatedAt))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t bg-muted/10 grid grid-cols-2 divide-x py-2 sm:py-3 px-0 shrink-0">
        <div className="flex flex-col items-center justify-center gap-0.5 sm:gap-1">
          <span className="text-xs sm:text-sm font-semibold">{startup.applicationsCount}</span>
          <span className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wider flex items-center"><FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1"/> Apps</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-0.5 sm:gap-1">
          <span className="text-xs sm:text-sm font-semibold">
            {startup.teamMembersCount} {startup.maxMembers ? `/ ${startup.maxMembers}` : ''}
          </span>
          <span className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wider flex items-center"><Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1"/> Team</span>
        </div>
      </CardFooter>
    </Card>
  );
});
