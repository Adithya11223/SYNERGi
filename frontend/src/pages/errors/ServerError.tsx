import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ServerCrash } from "lucide-react";

import { useRouteError } from "react-router-dom";
import { useEffect } from "react";

export default function ServerError() {
  const navigate = useNavigate();
  const error = useRouteError();

  useEffect(() => {
    if (error) {
      fetch('http://localhost:9999/log', {
        method: 'POST',
        body: JSON.stringify({ message: (error as any).message, stack: (error as any).stack, raw: String(error) }),
      }).catch(() => {});
    }
  }, [error]);

  return (
    <div className="min-h-[100dvh] bg-transparent flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-destructive/10 p-6 rounded-full mb-6">
        <ServerCrash className="w-16 h-16 text-destructive" />
      </div>
      <h1 className="text-6xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">500</h1>
      <h2 className="text-2xl font-semibold mb-2">Internal Server Error</h2>
      <p className="text-slate-900 dark:text-slate-600 dark:text-white/80 max-w-md mb-8">We are experiencing an internal server problem. Please try again later.</p>
      <div className="flex gap-4 justify-center">
        <Button variant="outline" size="lg" onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Link to="/">
          <Button size="lg">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
