import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { founderApplicationService } from "@/services/founderApplicationService";
import type { ApplicationResponse } from "@/services/talentApplicationService";
import { 
  ArrowLeft, CheckCircle2, XCircle, Clock, Search, ExternalLink, 
  User, Briefcase, FileText, Code2, Link as LinkIcon, Calendar, Globe, MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { getImageUrl } from "@/lib/utils";

export default function ReviewApplication() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<ApplicationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      founderApplicationService.getApplicationDetails(id)
        .then(setApp)
        .catch(() => toast.error("Failed to load application details"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleUpdateStatus = async (status: string) => {
    if (!app) return;
    setUpdating(true);
    try {
      await founderApplicationService.updateApplicationStatus(app.uuid, status);
      setApp({ ...app, status });
      toast.success(`Application marked as ${status}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-base py-1 px-4"><Clock className="w-4 h-4 mr-2" /> Pending Review</Badge>;
      case 'SHORTLISTED': return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-base py-1 px-4"><Search className="w-4 h-4 mr-2" /> Shortlisted</Badge>;
      case 'ACCEPTED': return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-base py-1 px-4"><CheckCircle2 className="w-4 h-4 mr-2" /> Accepted</Badge>;
      case 'REJECTED': return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-base py-1 px-4"><XCircle className="w-4 h-4 mr-2" /> Rejected</Badge>;
      case 'WITHDRAWN': return <Badge variant="secondary" className="text-base py-1 px-4">Withdrawn by Talent</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) return <div className="p-20 flex justify-center"><Skeleton className="h-[400px] sm:h-[600px] w-full max-w-4xl rounded-2xl" /></div>;
  if (!app) return <Navigate to="/404" replace />;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6 pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <Link to="/founder/applications">
            <Button variant="outline" size="icon" className="rounded-full h-8 w-8 md:h-10 md:w-10"><ArrowLeft className="w-4 h-4 md:w-5 md:h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Review Application</h1>
            <p className="text-slate-900 dark:text-slate-600 dark:text-white/80 text-xs md:text-sm">For {app.startupName} • Applied {formatDistanceToNow(new Date(app.createdAt))} ago</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {app.status === 'ACCEPTED' && (
            <Link to={`/founder/workspace/${app.startupUuid}`} state={{ from: location.pathname }}>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_15px_rgba(52,211,153,0.3)] interactive-glass-button hidden md:flex">
                Open Workspace
              </Button>
            </Link>
          )}
          {getStatusBadge(app.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          
          <Card>
            <CardHeader className="p-4 md:p-5 pb-2 md:pb-3"><CardTitle className="text-base md:text-lg flex items-center gap-2"><User className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Personal Pitch</CardTitle></CardHeader>
            <CardContent className="p-4 md:p-5 pt-0 space-y-4">
              <div>
                <h4 className="text-[11px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 md:mb-1.5">Introduction</h4>
                <p className="text-sm md:text-[15px] text-foreground whitespace-pre-wrap leading-relaxed">{app.introduction}</p>
              </div>
              <div>
                <h4 className="text-[11px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 md:mb-1.5">Why join this startup?</h4>
                <p className="text-sm md:text-[15px] text-foreground whitespace-pre-wrap leading-relaxed">{app.whyJoin}</p>
              </div>
              <div>
                <h4 className="text-[11px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 md:mb-1.5">Why they are the right fit</h4>
                <p className="text-sm md:text-[15px] text-foreground whitespace-pre-wrap border-l-2 md:border-l-4 border-primary/50 pl-3 md:pl-4 py-0.5 md:py-1 italic">{app.whyRightFit}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 md:p-5 pb-2 md:pb-3"><CardTitle className="text-base md:text-lg flex items-center gap-2"><Briefcase className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Professional Details</CardTitle></CardHeader>
            <CardContent className="p-4 md:p-5 pt-0 grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Applying for Role</p>
                <p className="font-medium text-base">{app.preferredRole}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Current Occupation</p>
                <p className="font-medium text-sm md:text-base">{app.currentOccupation || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Experience</p>
                <p className="font-medium text-sm md:text-base">{app.yearsExperience || "Not specified"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground mb-1.5">Core Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {(app.skills ? app.skills.split(',') : []).map((s, i) => <Badge key={i} variant="secondary" className="px-2 py-0.5 text-xs">{s.trim()}</Badge>)}
                </div>
              </div>
              {app.technologiesKnown && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Technologies</p>
                  <p className="text-sm">{app.technologiesKnown}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {(app.previousStartupExperience || app.openSourceContributions || app.achievements || app.additionalNotes) && (
            <Card>
              <CardHeader className="p-4 md:p-5 pb-2 md:pb-3"><CardTitle className="text-base md:text-lg flex items-center gap-2"><FileText className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Additional Background</CardTitle></CardHeader>
              <CardContent className="p-4 md:p-5 pt-0 space-y-4">
                {app.previousStartupExperience && <div><p className="text-[11px] md:text-xs text-muted-foreground mb-0.5">Previous Startup Experience</p><p className="text-sm md:text-[15px]">{app.previousStartupExperience}</p></div>}
                {app.openSourceContributions && <div><p className="text-[11px] md:text-xs text-muted-foreground mb-0.5">Open Source Contributions</p><p className="text-sm md:text-[15px]">{app.openSourceContributions}</p></div>}
                {app.achievements && <div><p className="text-[11px] md:text-xs text-muted-foreground mb-0.5">Achievements</p><p className="text-sm md:text-[15px]">{app.achievements}</p></div>}
                {app.additionalNotes && <div><p className="text-[11px] md:text-xs text-muted-foreground mb-0.5">Additional Notes</p><p className="text-sm md:text-[15px]">{app.additionalNotes}</p></div>}
              </CardContent>
            </Card>
          )}

        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-6">
          
          <Card className="border-primary/20 shadow-md">
            <CardContent className="p-4 md:p-6 text-center">
              <Link to={`/founder/profile/${app.talentUuid}`} className="block hover:opacity-80 transition-opacity">
                {app.talentAvatarUrl ? (
                  <img src={getImageUrl(app.talentAvatarUrl)} alt={app.talentName} className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover mx-auto mb-3 md:mb-4 shadow-sm border" />
                ) : (
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/10 flex items-center justify-center font-bold text-2xl md:text-3xl text-primary mx-auto mb-3 md:mb-4 uppercase border">
                    {app.talentName.substring(0, 2)}
                  </div>
                )}
                <h2 className="text-lg md:text-xl font-bold hover:underline">{app.talentName}</h2>
              </Link>
              <p className="text-slate-900 dark:text-slate-600 dark:text-white/80 text-xs md:text-sm mt-1">{app.talentEmail}</p>
              
              <Link to={`/founder/workspace/${app.startupUuid}/chat`} state={{ openPrivateChatWithUserUuid: app.talentUuid, from: location.pathname }}>
                <Button 
                  variant="outline" size="sm"
                  className="w-full mt-4 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
                >
                  <MessageSquare className="w-4 h-4 mr-2" /> Message Talent
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2"><CardTitle className="text-base flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Portfolio & Links</CardTitle></CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {app.resumeUrl ? (
                <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-md border bg-primary/5 hover:bg-primary/10 transition-colors text-primary font-medium text-sm">
                  <FileText className="w-4 h-4" /> View Resume <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                </a>
              ) : <p className="text-[13px] text-muted-foreground">No resume provided.</p>}
              
              {app.linkedinUrl && (
                <a href={app.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-md border hover:bg-muted transition-colors text-[13px]">
                  <User className="w-3.5 h-3.5" /> LinkedIn <ExternalLink className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
                </a>
              )}
              {app.githubUrl && (
                <a href={app.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-md border hover:bg-muted transition-colors text-[13px]">
                  <Code2 className="w-3.5 h-3.5" /> GitHub <ExternalLink className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
                </a>
              )}
              {app.portfolioUrl && (
                <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-md border hover:bg-muted transition-colors text-[13px]">
                  <Globe className="w-3.5 h-3.5" /> Portfolio <ExternalLink className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
                </a>
              )}
              {app.personalWebsiteUrl && (
                <a href={app.personalWebsiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-md border hover:bg-muted transition-colors text-[13px]">
                  <Globe className="w-3.5 h-3.5" /> Website <ExternalLink className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
                </a>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2"><CardTitle className="text-base flex items-center gap-2"><Calendar className="w-4 h-4" /> Availability</CardTitle></CardHeader>
            <CardContent className="p-4 pt-0 grid grid-cols-2 gap-3">
              <div><p className="text-[11px] md:text-xs text-muted-foreground mb-0.5">Hours/Week</p><p className="font-medium text-[13px] md:text-sm">{app.hoursAvailable || "Not specified"}</p></div>
              <div><p className="text-[11px] md:text-xs text-muted-foreground mb-0.5">Style</p><p className="font-medium text-[13px] md:text-sm truncate">{app.preferredWorkingStyle || "Not specified"}</p></div>
              <div className="col-span-2"><p className="text-[11px] md:text-xs text-muted-foreground mb-0.5">Start Date</p><p className="font-medium text-[13px] md:text-sm">{app.availableStartDate || "Not specified"}</p></div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Action Bar (Moved to bottom of page) */}
      {app.status !== 'WITHDRAWN' && (
        <div className="mt-8 p-4 glass-floating border border-[var(--glass-border-strong)] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex justify-center mx-auto max-w-4xl">
          <div className="w-full flex items-center justify-between gap-4">
            <p className="hidden sm:block text-sm font-medium">Update Application Status</p>
            <div className="flex gap-3 w-full sm:w-auto">
              {app.status !== 'REJECTED' && (
                <Button variant="outline" className="flex-1 sm:w-32 border-destructive text-destructive hover:bg-destructive/10" disabled={updating} onClick={() => handleUpdateStatus('REJECTED')}>
                  <XCircle className="w-4 h-4 mr-2" /> Reject
                </Button>
              )}
              
              {app.status === 'PENDING' && (
                <Button variant="outline" className="flex-1 sm:w-32 border-blue-500 text-blue-500 hover:bg-blue-500/10" disabled={updating} onClick={() => handleUpdateStatus('SHORTLISTED')}>
                  <Search className="w-4 h-4 mr-2" /> Shortlist
                </Button>
              )}
              
              {app.status !== 'ACCEPTED' && (
                <Button className="flex-1 sm:w-32 bg-emerald-600 hover:bg-emerald-700" disabled={updating} onClick={() => handleUpdateStatus('ACCEPTED')}>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Accept
                </Button>
              )}
              {app.status === 'ACCEPTED' && (
                <Link to={`/founder/workspace/${app.startupUuid}`} state={{ from: location.pathname }} className="flex-1 sm:w-auto">
                  <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_15px_rgba(52,211,153,0.3)] interactive-glass-button">
                    Go to Workspace
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
