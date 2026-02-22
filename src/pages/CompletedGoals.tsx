import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavArrowLeft } from 'iconoir-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCompletedGoalsHistory, CompletedGoalEntry } from '@/hooks/useCompletedGoalsHistory';
import { format, parseISO } from 'date-fns';

const CompletedGoals: React.FC = () => {
  const navigate = useNavigate();
  const { completions, isLoading } = useCompletedGoalsHistory();

  // Group by gregorian_date
  const grouped = useMemo(() => {
    const map = new Map<string, CompletedGoalEntry[]>();
    for (const c of completions) {
      const key = c.gregorian_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    return Array.from(map.entries());
  }, [completions]);

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/goals')}>
            <NavArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="md:text-4xl tracking-tight font-display text-4xl font-normal">Completed</h1>
            <p className="text-base text-muted-foreground mt-1 font-normal">
              Your goal completion history.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : completions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">No completed goals yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([date, entries]) => (
              <div key={date} className="space-y-2">
                <h2 className="text-sm font-medium text-muted-foreground sticky top-14 bg-background py-1 z-10">
                  {format(parseISO(date), 'EEEE, d MMMM yyyy')}
                </h2>
                <div className="space-y-2">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                    >
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <svg className="h-3 w-3 text-primary" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 6l3 3 5-5" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-medium leading-tight">{entry.goal_title}</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                            {entry.goal_recurrence_type}
                          </Badge>
                        </div>
                        {entry.goal_description && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{entry.goal_description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedGoals;
