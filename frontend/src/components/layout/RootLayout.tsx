import React from 'react';
import { Outlet } from "react-router-dom";
import { GlobalCallProvider } from "@/components/chat/GlobalCallProvider";
import { CallOverlay } from "@/components/chat/CallOverlay";
import { CallWaitingOverlay } from "@/components/chat/CallWaitingOverlay";
import { DynamicIslandCall } from "@/components/chat/DynamicIslandCall";
import { useCallStore } from "@/store/useCallStore";
import { useTitleSync } from '@/hooks/useTitleSync';

/**
 * RootLayout — wraps every route inside the router.
 * Mounts GlobalCallProvider (voice call logic) and IncomingCallBanner
 * once for the entire app, inside the router context so useLocation works.
 */
export function RootLayout() {
  useTitleSync();
  const uiMode = useCallStore(s => s.uiMode);
  
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <GlobalCallProvider>
      {!isMobile && uiMode === 'mini_floating' && (
        <CallOverlay mode={uiMode} />
      )}
      {isMobile && <DynamicIslandCall />}
      <CallWaitingOverlay />
      <Outlet />
    </GlobalCallProvider>
  );
}
