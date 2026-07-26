import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, Filter, Rocket, AlertCircle } from "lucide-react";
import { StartupCard } from "@/components/startup/StartupCard";
import type { StartupResponse } from "@/components/startup/StartupCard";
import { startupService } from "@/services/myStartupService";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MyStartups() {
  const [startups, setStartups] = useState<StartupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy] = useState("newest");

  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchStartups();
  }, []);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      const data = await startupService.getMyStartups();
      setStartups(data);
    } catch (error) {
      toast.error("Failed to fetch startups");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await startupService.deleteStartup(deleteId);
      toast.success("Startup deleted successfully");
      setStartups(startups.filter(s => s.uuid !== deleteId));
    } catch (error) {
      toast.error("Failed to delete startup");
    } finally {
      setDeleteId(null);
    }
  };

  const handleArchive = async (uuid: string) => {
    try {
      await startupService.updateStatus(uuid, 'ARCHIVED');
      toast.success("Startup archived");
      fetchStartups();
    } catch (error) {
      toast.error("Failed to archive startup");
    }
  };

  const handlePublish = async (uuid: string) => {
    try {
      await startupService.updateStatus(uuid, 'PUBLISHED');
      toast.success("Startup published successfully!");
      fetchStartups();
    } catch (error) {
      toast.error("Failed to publish startup");
    }
  };

  const filteredStartups = startups
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.tagline?.toLowerCase().includes(search.toLowerCase()))
    .filter(s => statusFilter === "ALL" || s.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortBy === "oldest") return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="p-2 sm:p-4 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold tracking-tight">My Startups</h2>
          <p className="text-sm sm:text-base text-slate-900 dark:text-slate-600 dark:text-white/80 mt-1 sm:mt-2">Manage your startup ideas and workspaces.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-row items-center gap-2 glass-card p-2 sm:p-4 rounded-[1.25rem] sm:rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search startups..."
            className="pl-10 h-10 bg-transparent border-none focus-visible:ring-0 shadow-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-white/10 shrink-0">
              <Filter className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 glass-surface">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>All Statuses</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("DRAFT")}>Drafts</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("PUBLISHED")}>Published</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("ARCHIVED")}>Archived</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-xl border glass-card p-0 flex flex-col overflow-hidden min-h-[340px] h-auto">
              <Skeleton className="h-32 w-full rounded-none" />
              <div className="p-5 flex-1 flex flex-col gap-3">
                <Skeleton className="h-16 w-16 rounded-xl -mt-12 mb-2 border-4 border-background bg-muted" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="mt-auto flex gap-2 pt-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredStartups.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 pb-24 lg:pb-0">
          {filteredStartups.map(startup => (
            <StartupCard
              key={startup.uuid}
              startup={startup}
              onDelete={setDeleteId}
              onArchive={handleArchive}
              onPublish={handlePublish}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border rounded-2xl glass-card border-dashed">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Rocket className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight mb-2">No startups found</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            {search || statusFilter !== 'ALL'
              ? "We couldn't find any startups matching your current filters."
              : "You haven't created any startups yet. Start building your next big idea today!"}
          </p>
          <div className="flex gap-4">
            {(search || statusFilter !== 'ALL') ? (
              <Button variant="outline" onClick={() => {
                setSearch(""); setStatusFilter("ALL");
              }}>
                Clear Filters
              </Button>
            ) : (
              <Link to="/founder/startups/create">
                <Button><Plus className="w-4 h-4 mr-2" /> Create Your First Startup</Button>
              </Link>
            )}
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" /> Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this startup? This action will remove it from your dashboard.
              (If published, it will be removed from the public directory).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Startup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Floating Action Button for Create Startup */}
      <Link to="/founder/startups/create" className="fixed bottom-[88px] lg:bottom-8 right-4 lg:right-8 z-50">
        <Button className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-[0_8px_30px_rgba(56,103,255,0.4)] shadow-primary flex items-center justify-center p-0 interactive-glass-button hover:scale-105">
          <Plus className="w-6 h-6 text-white" />
        </Button>
      </Link>
    </div>
  );
}
