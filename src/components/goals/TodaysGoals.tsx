import React from 'react';
import { Archery, Check } from 'iconoir-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { Goal } from '@/types/goals';

interface TodaysGoalsProps {
  goalsDueToday: Goal[];
  goalsCompleted: number;
  goalsTotal: number;
  isCompleted: (goalId: string) => boolean;
  onToggle: (goalId: string) => void;
  isToggling?: boolean;
}

const TodaysGoals: React.FC<TodaysGoalsProps> = ({
  goalsDueToday,
  goalsCompleted,
  goalsTotal,
  isCompleted,
  onToggle,
  isToggling = false,
}) => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Archery className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold font-display tracking-tight">Today's Goals</h2>
        </div>
        <span className="text-sm text-muted-foreground font-medium">
          {goalsCompleted}/{goalsTotal}
        </span>
      </div>

      {goalsTotal === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-3">No goals scheduled for today</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/goals')}>
            Manage Goals
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {goalsDueToday.map((goal) => {
            const completed = isCompleted(goal.id);
            return (
              <div
                key={goal.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <Checkbox
                  checked={completed}
                  onCheckedChange={() => onToggle(goal.id)}
                  disabled={isToggling}
                  className="h-5 w-5"
                />
                <span
                  className={`text-base flex-1 font-medium ${
                    completed ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {goal.title}
                </span>
                {completed && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TodaysGoals;
