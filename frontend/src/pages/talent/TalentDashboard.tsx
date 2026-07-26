import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { apiClient as api } from '@/lib/apiClient';

interface TalentAnalyticsData {
  applicationsSubmitted: number;
  acceptedStartups: number;
  assignedTasks: number;
  upcomingMeetings: number;
  recentTasks: any[];
}

import { useNavigate } from 'react-router-dom';
export default function TalentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<TalentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get<{ data: TalentAnalyticsData }>('/analytics/talent');
        setData(res.data.data);
      } catch (error) {
        /* console.error removed */
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-0 sm:p-4 lg:p-8 w-full max-w-[1920px] mx-auto space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-2 w-full sm:w-auto">
            <Skeleton className="h-9 w-48 sm:w-64" />
            <Skeleton className="h-5 w-64 sm:w-full max-w-80" />
          </div>
          <Skeleton className="h-[38px] w-[85px] rounded-lg mt-2 sm:mt-0" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 sm:gap-8 items-start mt-6 sm:mt-8">
          <div className="flex flex-col gap-6 sm:gap-8 min-w-0">
            <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-[120px] rounded-xl" />)}
            </div>
            <Skeleton className="h-64 sm:h-[400px] rounded-xl w-full" />
          </div>
          <div className="flex flex-col gap-6 sm:gap-8">
            <Skeleton className="h-64 sm:h-[400px] rounded-xl w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-0 sm:p-4 lg:p-8 w-full max-w-[1920px] mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Talent Dashboard</h2>
          <p className="text-slate-900 dark:text-slate-600 dark:text-white/80 mt-2">Overview of your applications and workspace activity.</p>
        </div>
        <Link to="/talent/startups" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium interactive-glass-button">
          Browse
        </Link>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 sm:gap-8 items-start mt-6 sm:mt-8">
        <div className="flex flex-col gap-6 sm:gap-8 min-w-0">
          <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
            <div className="glass-surface p-4 sm:p-6 rounded-2xl shadow-sm border border-[var(--glass-border)]">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="text-xs sm:text-sm font-medium text-foreground dark:text-slate-900 dark:text-white">Applications</h3>
                <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground dark:text-slate-900 dark:text-white">{data.applicationsSubmitted}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Total submitted</p>
              </div>
            </div>
            
            <div className="glass-surface p-4 sm:p-6 rounded-2xl shadow-sm border border-[var(--glass-border)]">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="text-xs sm:text-sm font-medium text-foreground dark:text-slate-900 dark:text-white">Workspaces</h3>
                <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground dark:text-slate-900 dark:text-white">{data.acceptedStartups}</div>
                <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-500 font-medium mt-1">Accepted startups</p>
              </div>
            </div>
            
            <div className="glass-surface p-4 sm:p-6 rounded-2xl shadow-sm border border-[var(--glass-border)]">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="text-xs sm:text-sm font-medium text-foreground dark:text-slate-900 dark:text-white">My Tasks</h3>
                <svg className="h-4 w-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground dark:text-slate-900 dark:text-white">{data.assignedTasks}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Assigned to you</p>
              </div>
            </div>

            <div className="glass-surface p-4 sm:p-6 rounded-2xl shadow-sm border border-[var(--glass-border)]">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="text-xs sm:text-sm font-medium text-foreground dark:text-slate-900 dark:text-white">Meetings</h3>
                <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground dark:text-slate-900 dark:text-white">{data.upcomingMeetings}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Upcoming events</p>
              </div>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-foreground dark:text-white">Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-16">
                No recent notifications to display.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 sm:gap-8">
          <Card>
          <CardHeader>
            <CardTitle className="text-lg text-foreground dark:text-white">My Active Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentTasks.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                You have no active tasks assigned.
              </div>
            ) : (
              <ul className="space-y-3">
                {data.recentTasks.map((task: any) => (
                  <li 
                    key={task.uuid} 
                    className="flex items-center justify-between p-3 glass-surface/50 rounded-xl border border-transparent hover:border-primary/20 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/talent/workspace/${task.startupUuid}`);
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-foreground dark:text-slate-900 dark:text-white text-sm">{task.title}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] py-0">{task.status?.replace('_', ' ')}</Badge>
                        {task.dueDate && <span>Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                      </div>
                    </div>
                    {task.assigneeName && (
                      <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0" title={task.assigneeName}>
                        {task.assigneeName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      

    </div>
  );
}


