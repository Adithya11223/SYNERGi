import { Search, Plus } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { chatService } from '@/services/chatService';
import { toast } from 'sonner';
// import { useChatStore } from '@/store/useChatStore';
interface TeamChatSidebarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filter: 'All' | 'Direct Messages' | 'Groups';
  setFilter: (val: 'All' | 'Direct Messages' | 'Groups') => void;
  activeTab: 'chats' | 'calls';
  setActiveTab: (val: 'chats' | 'calls') => void;
  setIsGroupModalOpen: (val: boolean) => void;
  filteredItems: any[];
  workspaceId: string | undefined;
  roomId: string | undefined;
  user: any;
  callLogs: any[];
}

export function TeamChatSidebar({
  searchQuery, setSearchQuery, filter, setFilter,
  activeTab, setIsGroupModalOpen,
  filteredItems, workspaceId, roomId, user, callLogs
}: TeamChatSidebarProps) {
  const navigate = useNavigate();
  

  return (
    <div className={`w-full md:w-[350px] flex-col border-r border-white/10 dark:border-white/5 bg-white/5 dark:bg-black/20 shrink-0 ${!roomId ? 'flex' : 'hidden md:flex'} rounded-t-[var(--radius)] lg:rounded-t-none lg:rounded-tl-[var(--radius)] lg:rounded-bl-[var(--radius)]`}>
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 shrink-0">
        <h2 className="text-xl font-bold">Chats</h2>

        <div className="flex items-center space-x-2">
          {user?.role === 'FOUNDER' && (
            <button 
              onClick={() => setIsGroupModalOpen(true)}
              className="p-2 rounded-full hover:bg-white/10 text-muted-foreground transition-colors"
              title="Create Group"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}

        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-3 shrink-0">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search or start a new chat" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 text-sm rounded-full pl-9 pr-4 py-2 border border-white/5 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      {activeTab === 'chats' && (
        <div className="px-4 pb-2 flex gap-2 shrink-0 overflow-x-auto custom-scrollbar">
          {['All', 'Direct Messages', 'Groups'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filter === f 
                  ? 'bg-primary/20 text-primary border border-primary/30' 
                  : 'bg-black/40 text-muted-foreground hover:text-white border border-transparent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {activeTab === 'chats' ? (
          filteredItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => {
                const basePath = user?.role === 'FOUNDER' || user?.role === 'OWNER' ? '/founder' : '/talent';
                if (item.type === 'PRIVATE') {
                   if (item.roomUuid) {
                       navigate(`${basePath}/workspace/${workspaceId}/chat/${item.roomUuid}`);
                   } else {
                       chatService.getOrCreatePrivateChat(workspaceId!, item.id).then(newRoom => {
                           navigate(`${basePath}/workspace/${workspaceId}/chat/${newRoom.uuid}`);
                       }).catch(() => toast.error("Failed to start chat"));
                   }
                } else {
                   navigate(`${basePath}/workspace/${workspaceId}/chat/${item.roomUuid}`);
                }
              }}
              className={`flex items-center gap-3 p-3 mx-2 rounded-[var(--radius-sm)] cursor-pointer transition-all mb-1 interactive-glass ${
                item.roomUuid && item.roomUuid === roomId
                  ? 'bg-white/10 shadow-[0_0_20px_rgba(56,103,255,0.15)] border border-white/20' 
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="relative shrink-0 w-12 h-12 transition-transform duration-500 ease-[var(--ease-spring)]">
                {item.type === 'PRIVATE' || item.iconUrl ? (
                  <img 
                    src={getImageUrl(item.iconUrl) || `https://api.dicebear.com/7.x/initials/svg?seed=${item.name}&backgroundColor=000000`} 
                    alt={item.name} 
                    className="w-full h-full rounded-full object-cover bg-white border border-white/10 transition-opacity duration-300"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center transition-opacity duration-300">
                    <span className="text-primary font-medium text-lg">{item.name.charAt(0)}</span>
                  </div>
                )}
                
                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-background rounded-full shrink-0 transition-all duration-300 ${
                  item.inVoiceCall ? 'bg-orange-500 scale-100 opacity-100 flex items-center justify-center' :
                  item.status === 'BUSY' ? 'bg-red-500 scale-100 opacity-100' :
                  item.isOnline ? 'bg-green-500 scale-100 opacity-100' :
                  'scale-0 opacity-0'
                }`}>
                   {item.inVoiceCall && <span className="text-[6px] text-white">📞</span>}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-sm truncate text-foreground/90">{item.name}</h3>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                    {item.latestActivity ? new Date(item.latestActivity).toLocaleDateString() : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-xs truncate max-w-[180px] ${item.unreadCount > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {item.description}
                  </p>
                  {item.unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-2 shrink-0">
                      {item.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4">
             {callLogs.map((log: any) => (
                <div key={log.uuid} className="flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5 rounded-lg mb-1">
                  <div className="flex items-center gap-3">
                    <img src={getImageUrl(log.callerAvatarUrl) || `https://api.dicebear.com/7.x/initials/svg?seed=${log.callerName}`} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="text-sm font-medium">{log.callerName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(log.startedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                     {log.status}
                  </div>
                </div>
             ))}
             {callLogs.length === 0 && <p className="text-sm text-muted-foreground text-center mt-4">No recent calls</p>}
          </div>
        )}
      </div>
    </div>
  );
}
