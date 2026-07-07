"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BookOpen, Brain, Zap, Target } from "lucide-react";

export type ActivityType = "review" | "quiz" | "exam";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  score?: number;
}

interface RecentActivityProps {
  events: ActivityEvent[];
}

export function RecentActivity({ events }: RecentActivityProps) {
  
  const getTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    
    return new Date(dateStr).toLocaleDateString();
  };

  const getIcon = (type: ActivityType) => {
    switch (type) {
      case "review": return <BookOpen className="w-4 h-4 text-orange-500" />;
      case "quiz": return <Zap className="w-4 h-4 text-blue-500" />;
      case "exam": return <Target className="w-4 h-4 text-purple-500" />;
      default: return <Brain className="w-4 h-4 text-[var(--muted)]" />;
    }
  };

  return (
    <Card className="flex flex-col h-full border-[var(--border)] shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-[var(--color-primary)]" />
          Recent Activity
        </CardTitle>
        <CardDescription className="mt-1 text-sm">
          Your latest study sessions
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1">
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-[var(--muted)] border border-dashed border-[var(--border)] rounded-lg py-8">
            No recent activity. Start studying!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-start gap-3">
                <div className="mt-0.5 bg-[var(--surface-hover)] p-2 rounded-full border border-[var(--border)]">
                  {getIcon(event.type)}
                </div>
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-sm truncate">{event.title}</span>
                    <span className="text-xs text-[var(--muted)] whitespace-nowrap">
                      {getTimeAgo(event.timestamp)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-[var(--muted)] truncate">
                      {event.description}
                    </span>
                    {event.score !== undefined && (
                      <span className={`text-xs font-bold ${event.score >= 80 ? 'text-green-600 dark:text-green-400' : event.score >= 50 ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'}`}>
                        {event.score}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
