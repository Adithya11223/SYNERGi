import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { talentStartupService } from "@/services/talentStartupService";
import type { ExploreStartupResponse } from "@/services/talentStartupService";
import { PublicStartupCard } from "@/components/startup/PublicStartupCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/lib/hooks";

export default function BrowseStartups({ hideHeader = false, headerAddon }: { hideHeader?: boolean; headerAddon?: React.ReactNode }) {
  const [items, setItems] = useState<ExploreStartupResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [sortBy] = useState("createdAt");

  
    const [page, setPage] = useState(0);

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, sortBy, page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const startupRes = await talentStartupService.exploreStartups({
        search: debouncedSearch,
        sortBy: sortBy,
        sortDir: 'desc',
        page,
        size: 12
      });
      
      setItems(startupRes.content);
      setTotalPages(startupRes.totalPages);
      setTotalElements(startupRes.totalElements);

    } catch (error) {
      /* console.error removed */
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setPage(0);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Area */}
      {!hideHeader && (
        <div className="glass-card border-b px-6 py-8 shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent z-0 pointer-events-none" />
          <div className="w-full max-w-[1920px] mx-auto relative z-10 flex flex-col md:flex-row gap-6 md:items-end justify-between">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Discover Startups</h1>
              <p className="text-slate-900 dark:text-slate-600 dark:text-white/80 mt-2 text-lg">Find the perfect startup idea and apply to join their team.</p>
            </div>
            
            <div className="flex-1 max-w-md w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search by name, tags, or description..." 
                className="pl-12 h-12 rounded-full bg-transparent shadow-sm text-base"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              />
            </div>
          </div>
        </div>
      )}

      {hideHeader && (
        <div className="px-4 sm:px-8 pt-2 pb-4 w-full max-w-[1920px] mx-auto shrink-0 sticky top-0 z-20 bg-transparent">
          <div className="flex items-center gap-2 glass-card p-2 sm:p-4 rounded-[1.25rem] sm:rounded-xl border shadow-sm w-full md:max-w-md">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              <Input 
                placeholder="Search by name, tags, or description..." 
                className="pl-10 h-10 sm:pl-12 sm:h-12 bg-transparent border-none focus-visible:ring-0 shadow-none text-sm sm:text-base"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              />
            </div>
            {headerAddon}
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden w-full max-w-[1920px] mx-auto">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-8 bg-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-2 sm:mb-6 px-0 md:px-0">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground font-medium hidden sm:block">
                {totalElements} startups found
              </p>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 pb-24 lg:pb-0">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="rounded-xl border glass-card p-0 flex flex-col overflow-hidden min-h-[280px] sm:min-h-[380px] h-auto">
                  <Skeleton className="h-20 sm:h-32 w-full rounded-none" />
                  <div className="p-3 sm:p-5 flex-1 flex flex-col gap-2 sm:gap-3">
                    <div className="flex justify-between -mt-8 sm:-mt-12 mb-1 sm:mb-2">
                      <Skeleton className="h-10 w-10 sm:h-16 sm:w-16 rounded-xl border-4 border-background bg-muted" />
                    </div>
                    <Skeleton className="h-4 sm:h-6 w-3/4" />
                    <Skeleton className="h-3 sm:h-4 w-full" />
                    <Skeleton className="h-3 sm:h-4 w-5/6" />
                    <div className="mt-auto space-y-1 sm:space-y-2">
                      <Skeleton className="h-3 sm:h-4 w-1/3" />
                      <div className="flex gap-1 sm:gap-2">
                        <Skeleton className="h-4 sm:h-5 w-12 sm:w-16 rounded-full" />
                        <Skeleton className="h-4 sm:h-5 w-12 sm:w-16 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : items.length ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 pb-24 lg:pb-0">
                {items.map((startup, index) => (
                  <PublicStartupCard key={`startup-${startup.uuid}-${index}`} startup={startup} />
                ))}
              </div>
              
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12 mb-8">
                  <Button 
                    variant="outline" 
                    disabled={page === 0} 
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                  </Button>
                  <span className="text-sm font-medium">Page {page + 1} of {totalPages}</span>
                  <Button 
                    variant="outline" 
                    disabled={page >= totalPages - 1} 
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center border rounded-2xl glass-card border-dashed">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Search className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2">No startups found</h3>
              <p className="text-slate-900 dark:text-slate-600 dark:text-white/80 max-w-md mx-auto mb-8">We couldn't find any startups matching your search. Try a different keyword.</p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Search & Filters
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
