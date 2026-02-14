import React, { useRef } from 'react';
import { Archery, Check } from 'iconoir-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useConfetti } from '@/components/ui/confetti';
import type { Goal, OverdueGoal } from '@/types/goals';
import type { AdminGoal } from '@/types/adminGoals';

interface TodaysGoalsProps {
  goalsDueToday: Goal[];
  goalsCompleted: number;
  goalsTotal: number;
  isCompleted: (goalId: string) => boolean;
  onToggle: (goalId: string) => void;
  isToggling?: boolean;
  overdueGoals?: OverdueGoal[];
  onCompleteOverdue?: (goalId: string) => void;
  isCompletingOverdue?: boolean;
  onCreateGoal?: () => void;
  // Dynamic goals
  dynamicGoals?: AdminGoal[];
  isDynamicCompleted?: (goalId: string) => boolean;
  onDynamicToggle?: (goalId: string) => void;
  isDynamicToggling?: boolean;
}

const TodaysGoals: React.FC<TodaysGoalsProps> = ({
  goalsDueToday,
  goalsCompleted,
  goalsTotal,
  isCompleted,
  onToggle,
  isToggling = false,
  overdueGoals = [],
  onCompleteOverdue,
  isCompletingOverdue = false,
  onCreateGoal,
  dynamicGoals = [],
  isDynamicCompleted,
  onDynamicToggle,
  isDynamicToggling = false,
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

  const handleOverdueToggle = (goalId: string) => {
    triggerConfetti(checkboxRefs.current.get(`overdue-${goalId}`));
    onCompleteOverdue?.(goalId);
  };

  const handleDynamicToggle = (goalId: string) => {
    if (isDynamicCompleted && !isDynamicCompleted(goalId)) {
      triggerConfetti(checkboxRefs.current.get(`dynamic-${goalId}`));
    }
    onDynamicToggle?.(goalId);
  };

  const hasOverdue = overdueGoals.length > 0;
  const totalDisplay = goalsTotal + overdueGoals.length + dynamicGoals.length;
  const completedDisplay = goalsCompleted;
  const totalForCounter = goalsTotal;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Archery className="h-5 w-5 text-primary" />
          <h2 className="font-display tracking-tight font-normal text-xl">Today's Goals</h2>
        </div>
        <div className="flex items-center gap-2">
          {hasOverdue && (
            <span className="text-xs font-medium text-destructive">
              {overdueGoals.length} overdue
            </span>
          )}
          <span className="label-caps">
            {completedDisplay}/{totalForCounter}
          </span>
        </div>
      </div>

      {totalDisplay === 0 ? (
        <div className="text-center py-8 space-y-4">
          <p className="text-sm text-muted-foreground italic max-w-xs mx-auto">
            "The deed dearest to Allah Ta'ala is that which is most consistent, even if small"
          </p>
          <p className="text-xs text-muted-foreground">— Al-Hadith</p>
          <Button onClick={onCreateGoal} className="rounded-full">
            Create your first goal
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Overdue goals first */}
          {overdueGoals.map((overdue) => (
            <div
              key={`overdue-${overdue.goal.id}`}
              className="flex items-center gap-4 rounded-xl border border-destructive/30 bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <Checkbox
                ref={(el) => {
                  const key = `overdue-${overdue.goal.id}`;
                  if (el) checkboxRefs.current.set(key, el);
                  else checkboxRefs.current.delete(key);
                }}
                checked={false}
                onCheckedChange={() => handleOverdueToggle(overdue.goal.id)}
                disabled={isCompletingOverdue}
                className="h-5 w-5"
              />
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => navigate('/goals')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate('/goals'); }}
              >
                <span className="text-base font-medium">{overdue.goal.title}</span>
                <p className="text-xs font-medium text-destructive mt-0.5">
                  {overdue.overdueDateLabel}
                </p>
              </div>
            </div>
          ))}

          {/* Today's goals */}
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
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => navigate('/goals')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate('/goals'); }}
                >
                  <span className={`text-base font-medium ${completed ? 'line-through text-muted-foreground' : ''}`}>
                    {goal.title}
                  </span>
                  {goal.description && (
                    <p className={`text-sm text-muted-foreground font-normal line-clamp-1 mt-0.5 ${completed ? 'line-through' : ''}`}>
                      {goal.description}
                    </p>
                  )}
                </div>
                {completed && <Check className="h-4 w-4 text-primary shrink-0" />}
              </div>
            );
          })}

          {/* Dynamic goals inline */}
          {dynamicGoals.map((goal) => {
            const completed = isDynamicCompleted?.(goal.id) ?? false;
            return (
              <div
                key={`dynamic-${goal.id}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <Checkbox
                  ref={(el) => {
                    const key = `dynamic-${goal.id}`;
                    if (el) checkboxRefs.current.set(key, el);
                    else checkboxRefs.current.delete(key);
                  }}
                  checked={completed}
                  onCheckedChange={() => handleDynamicToggle(goal.id)}
                  disabled={isDynamicToggling}
                  className="h-5 w-5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-base font-medium ${completed ? 'line-through text-muted-foreground' : ''}`}>
                      {goal.title}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 text-primary border-primary/30">
                      Dynamic
                    </Badge>
                  </div>
                  {goal.description && (
                    <p className={`text-sm text-muted-foreground font-normal line-clamp-1 mt-0.5 ${completed ? 'line-through' : ''}`}>
                      {goal.description}
                    </p>
                  )}
                </div>
                {completed && <Check className="h-4 w-4 text-primary shrink-0" />}
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
