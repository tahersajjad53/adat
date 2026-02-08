import React, { useRef } from 'react';
import { Archery, Check } from 'iconoir-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useConfetti } from '@/components/ui/confetti';
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
  const { triggerConfetti, ConfettiPortal } = useConfetti();
  const checkboxRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const handleToggle = (goalId: string) => {
    if (!isCompleted(goalId)) {
      triggerConfetti(checkboxRefs.current.get(goalId));
    }
    onToggle(goalId);
  };

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
                  ref={(el) => {
                    if (el) checkboxRefs.current.set(goal.id, el);
                    else checkboxRefs.current.delete(goal.id);
                  }}
                  checked={completed}
                  onCheckedChange={() => handleToggle(goal.id)}
                  disabled={isToggling}
                  className="h-5 w-5"
                />
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-base font-medium ${
                      completed ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {goal.title}
                  </span>
                  {goal.description && (
                    <p
                      className={`text-sm text-muted-foreground font-normal line-clamp-1 mt-0.5 ${
                        completed ? 'line-through' : ''
                      }`}
                    >
                      {goal.description}
                    </p>
                  )}
                </div>
                {completed && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
      <ConfettiPortal />
    </div>
  );
};

export default TodaysGoals;
