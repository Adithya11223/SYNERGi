import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import BrowseStartups from "@/pages/talent/BrowseStartups";
import BrowseTalent from "@/pages/founder/BrowseTalent";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UnifiedBrowse() {
  const [activeTab, setActiveTab] = useState("startups");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Unified Header */}
      <div className="px-4 sm:px-8 pt-6 pb-2 shrink-0 w-full max-w-[1920px] mx-auto flex flex-col md:flex-row gap-4 md:items-end justify-between">
        <div className="w-full md:w-auto">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center justify-start gap-2">
            Browse Network
          </h1>
          <p className="text-sm sm:text-base text-slate-900 dark:text-slate-600 dark:text-white/80 mt-1 sm:mt-2">Discover startups, talents, and founders across SYNERGi.</p>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 flex overflow-hidden">
        <TabsContent value="startups" className="flex-1 m-0 data-[state=active]:flex flex-col border-none p-0 outline-none h-full">
          <BrowseStartups hideHeader headerAddon={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 glass-surface">
                <DropdownMenuItem onClick={() => setActiveTab('startups')}>Startups</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('talents')}>Talents</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('founders')}>Founders</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          } />
        </TabsContent>
        <TabsContent value="talents" className="flex-1 m-0 data-[state=active]:flex flex-col border-none p-0 outline-none h-full">
          <BrowseTalent roleFilter="TALENT" hideHeader headerAddon={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 glass-surface">
                <DropdownMenuItem onClick={() => setActiveTab('startups')}>Startups</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('talents')}>Talents</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('founders')}>Founders</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          } />
        </TabsContent>
        <TabsContent value="founders" className="flex-1 m-0 data-[state=active]:flex flex-col border-none p-0 outline-none h-full">
          <BrowseTalent roleFilter="FOUNDER" hideHeader headerAddon={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 glass-surface">
                <DropdownMenuItem onClick={() => setActiveTab('startups')}>Startups</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('talents')}>Talents</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('founders')}>Founders</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          } />
        </TabsContent>
      </div>
    </Tabs>
  );
}
