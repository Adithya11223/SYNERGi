import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/App";
import { Users, Shield, UserMinus, MessageCircle, MoreVertical, Copy, User, Phone } from "lucide-react";
import { workspaceService } from "@/services/workspaceService";
import type { WorkspaceResponse } from "@/services/workspaceService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { getImageUrl } from '@/lib/utils';
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import {  useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function WorkspaceMembers() {
  const { workspace } = useOutletContext<{ workspace: WorkspaceResponse }>();
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  const { data: members = [], isLoading: loading } = useQuery({
    queryKey: ['members', workspace.startupUuid],
    queryFn: () => workspaceService.getWorkspaceMembers(workspace.startupUuid),
  });

  const handleRemoveMember = async (memberUuid: string) => {
    try {
      await workspaceService.removeMember(workspace.startupUuid, memberUuid);
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success("Member removed successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove member");
    }
  };

  const isOwner = user?.role === 'FOUNDER' && workspace.userRole === 'OWNER';

  const onlineStatuses = useChatStore(state => state.onlineStatuses);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchSearch = m.fullName.toLowerCase().includes(search.toLowerCase()) ||
        (m.username && m.username.toLowerCase().includes(search.toLowerCase())) ||
        m.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'ALL' || m.role === roleFilter;
      return matchSearch && matchRole;
    }).sort((a, b) => {
      // Sort Online users first, then by role (OWNER first)
      const aOnline = onlineStatuses[a.userUuid]?.isOnline ? 1 : 0;
      const bOnline = onlineStatuses[b.userUuid]?.isOnline ? 1 : 0;
      if (aOnline !== bOnline) return bOnline - aOnline;
      if (a.role === 'OWNER' && b.role !== 'OWNER') return -1;
      if (a.role !== 'OWNER' && b.role === 'OWNER') return 1;
      return a.fullName.localeCompare(b.fullName);
    });
  }, [members, search, roleFilter, onlineStatuses]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full flex flex-col">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Team Members</h2>
          <p className="text-slate-900 dark:text-slate-600 dark:text-white/80 mt-1">Manage everyone with access to this workspace.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-surface w-full sm:w-64"
          />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="glass-surface w-32">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="OWNER">Founder</SelectItem>
              <SelectItem value="TEAM_MEMBER">Talent</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="px-3 py-2 text-sm shrink-0 whitespace-nowrap"><Users className="w-4 h-4 mr-2" /> {filteredMembers.length} Members</Badge>
        </div>
      </div>

      <div className="w-full relative">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 pb-6">
          {filteredMembers.map(member => {
            const isUserOnline = onlineStatuses[member.userUuid]?.isOnline ?? member.isOnline;
            const lastSeen = onlineStatuses[member.userUuid]?.lastSeen || member.lastSeen;

            return (
              <Card key={member.userUuid} className="relative overflow-hidden group min-h-[160px] md:h-[216px] glass-card border-white/10 hover:border-primary/30 transition-colors flex flex-col">
                {member.role === 'OWNER' && (
                  <div className="absolute top-0 right-0 w-12 h-12 md:w-16 md:h-16 overflow-hidden pointer-events-none">
                    <div className="absolute transform rotate-45 bg-primary text-primary-foreground text-[8px] md:text-[10px] font-bold py-1 right-[-30px] md:right-[-35px] top-[24px] md:top-[32px] w-[140px] md:w-[170px] text-center shadow-md">
                      OWNER
                    </div>
                  </div>
                )}

                <CardContent className="p-3 md:p-6 flex flex-col h-full relative">
                  {/* Dropdown Menu */}
                  <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-6 w-6 md:h-8 md:w-8 p-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 glass-surface">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => toast.info('Profile view coming soon')}>
                          <User className="mr-2 h-4 w-4" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(window.location.origin + `/u/${member.username || member.userUuid}`).then(() => toast.success('Profile link copied!'))}>
                          <Copy className="mr-2 h-4 w-4" /> Copy Profile Link
                        </DropdownMenuItem>
                        {user?.uuid !== member.userUuid && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate(`/${user?.role?.toLowerCase()}/workspace/${workspace.startupUuid}/chat`, { state: { openPrivateChatWithUserUuid: member.userUuid } })}>
                              <MessageCircle className="mr-2 h-4 w-4" /> Private Chat
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info('Direct Call API coming soon')}>
                              <Phone className="mr-2 h-4 w-4" /> Call Member
                            </DropdownMenuItem>
                          </>
                        )}

                        {isOwner && member.role !== 'OWNER' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => toast.info('Promote API coming soon')}>
                              <Shield className="mr-2 h-4 w-4" /> Promote Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500 focus:bg-red-500/10 focus:text-red-500"
                              onClick={() => handleRemoveMember(member.userUuid)}
                            >
                              <UserMinus className="mr-2 h-4 w-4" /> Remove Member
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 mb-3 md:mb-4 text-center md:text-left">
                    <div className="relative shrink-0">
                      {member.avatarUrl ? (
                        <img src={getImageUrl(member.avatarUrl)} alt={member.fullName} className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border border-white/10" />
                      ) : (
                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-primary/20 flex items-center justify-center font-bold text-lg md:text-xl text-primary uppercase border border-primary/30">
                          {(member.fullName || member.username || member.email || "U").substring(0, 2)}
                        </div>
                      )}
                      {/* Online Status Indicator */}
                      <span className={`absolute bottom-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-[#12121A] ${isUserOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                    </div>

                    <div className="flex-1 min-w-0 pr-0 md:pr-6 w-full">
                      <h3 className="font-semibold text-sm md:text-lg truncate text-slate-900 dark:text-white leading-tight">{member.fullName}</h3>
                      <p className="text-[10px] md:text-sm text-muted-foreground truncate">@{member.username || member.email.split('@')[0]}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 md:space-y-2 mb-auto w-full">
                    <div className="flex justify-between items-center text-[10px] md:text-sm">
                      <span className="text-muted-foreground">Role</span>
                      <span className="font-medium flex items-center gap-1 text-slate-900 dark:text-slate-600 dark:text-white/90">
                        {member.role === 'OWNER' ? <Shield className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary" /> : null}
                        {member.assignedRole || (member.role === 'OWNER' ? 'Founder' : 'Talent')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] md:text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium text-slate-900 dark:text-slate-600 dark:text-white/90 text-right max-w-[80px] md:max-w-none truncate">
                        {isUserOnline ? 'Online' : (lastSeen ? `Last seen ${formatDistanceToNow(new Date(lastSeen))} ago` : 'Offline')}
                      </span>
                    </div>
                  </div>

                  {user?.uuid !== member.userUuid && (
                    <Button
                      variant="secondary"
                      className="w-full mt-3 md:mt-4 bg-white/5 text-white hover:bg-primary hover:text-white rounded-lg font-medium shadow-none transition-colors border border-white/5 h-8 md:h-10 text-xs md:text-sm"
                      onClick={() => navigate(`/${user?.role?.toLowerCase()}/workspace/${workspace.startupUuid}/chat`, { state: { openPrivateChatWithUserUuid: member.userUuid } })}
                    >
                      <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" /> Message
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
