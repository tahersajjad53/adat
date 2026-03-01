import React, { useRef, useState } from 'react';
import { Archery, Check, Trash } from 'iconoir-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useConfetti } from '@/components/ui/confetti';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import GoalDetailSheet from '@/components/goals/GoalDetailSheet';
import type { Goal, GoalWithStatus, OverdueGoal } from '@/types/goals';
import type { AdminGoal } from '@/types/adminGoals';
import { hasArabic } from '@/lib/textUtils';

const DYNAMIC_PREFIX = 'dynamic:';

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
  hasAnyGoals?: boolean;
  onDeleteGoal?: (goalId: string) => void;
  // Dynamic goals
  dynamicGoals?: AdminGoal[];
  isDynamicCompleted?: (goalId: string) => boolean;
  onDynamicToggle?: (goalId: string) => void;
  isDynamicToggling?: boolean;
  // Sorted unified list
  sortedGoals?: GoalWithStatus[];
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
  hasAnyGoals = false,
  onDeleteGoal,
  dynamicGoals = [],
  isDynamicCompleted,
  onDynamicToggle,
  isDynamicToggling = false,
  sortedGoals,
}) => {
  const navigate = useNavigate();
  const { triggerConfetti, ConfettiPortal } = useConfetti();
  const checkboxRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [viewingGoal, setViewingGoal] = useState<GoalWithStatus | null>(null);

  const handleToggle = (goalId: string) => {
    if (goalId.startsWith(DYNAMIC_PREFIX)) {
      const realId = goalId.slice(DYNAMIC_PREFIX.length);
      if (isDynamicCompleted && !isDynamicCompleted(realId)) {
        triggerConfetti(checkboxRefs.current.get(goalId));
      }
      onDynamicToggle?.(realId);
    } else {
      if (!isCompleted(goalId)) {
        triggerConfetti(checkboxRefs.current.get(goalId));
      }
      onToggle(goalId);
    }
  };

  const handleOverdueToggle = (goalId: string) => {
    triggerConfetti(checkboxRefs.current.get(`overdue-${goalId}`));
    onCompleteOverdue?.(goalId);
  };

  const hasOverdue = overdueGoals.length > 0;
  const dynamicCompletedCount = dynamicGoals.filter((g) => isDynamicCompleted?.(g.id)).length;
  const totalDisplay = goalsTotal + overdueGoals.length + dynamicGoals.length;
  const completedDisplay = goalsCompleted + dynamicCompletedCount;
  const totalForCounter = totalDisplay;

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
        </div>
      </div>

      {totalDisplay === 0 ? (
        <div className="text-center py-8 space-y-4">
          {hasAnyGoals ? (
            <>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                No goals for today — enjoy the calm.
              </p>
              <Button onClick={onCreateGoal} className="rounded-full">
                Create a goal
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground italic max-w-xs mx-auto">
                "The deed dearest to Allah Ta'ala is that which is most consistent, even if small"
              </p>
              <p className="text-xs text-muted-foreground">— Al-Hadith</p>
              <Button onClick={onCreateGoal} className="rounded-full">
                Create your first goal
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Overdue goals first */}
          {overdueGoals.map((overdue) => {
            const row = (
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
                  onClick={() => {
                    const goalWithStatus: GoalWithStatus = {
                      ...overdue.goal,
                      isCompleted: false,
                    };
                    setViewingGoal(goalWithStatus);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const goalWithStatus: GoalWithStatus = {
                        ...overdue.goal,
                        isCompleted: false,
                      };
                      setViewingGoal(goalWithStatus);
                    }
                  }}
                >
                  <span className="text-base font-medium">{overdue.goal.title}</span>
                  <p className="text-xs font-medium text-destructive mt-0.5">
                    {overdue.overdueDateLabel}
                  </p>
                </div>
              </div>
            );

            return (
              <ContextMenu key={`overdue-ctx-${overdue.goal.id}`}>
                <ContextMenuTrigger asChild>{row}</ContextMenuTrigger>
                <ContextMenuContent className="bg-popover">
                  <ContextMenuItem
                    onClick={() => onDeleteGoal?.(overdue.goal.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}

          {/* Sorted goals (user + dynamic unified) */}
          {(sortedGoals ?? goalsDueToday.map(g => ({ ...g, isCompleted: isCompleted(g.id) }))).map((goal) => {
            const isDynamic = !!(goal as GoalWithStatus).isDynamic;
            const completed = goal.isCompleted;
            const displayId = goal.id;
            const realId = isDynamic ? goal.id.slice(DYNAMIC_PREFIX.length) : goal.id;
            const isDisabled = isDynamic ? isDynamicToggling : isToggling;

            const row = (
              <div
                key={displayId}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <Checkbox
                  ref={(el) => {
                    if (el) checkboxRefs.current.set(displayId, el);
                    else checkboxRefs.current.delete(displayId);
                  }}
                  checked={completed}
                  onCheckedChange={() => handleToggle(displayId)}
                  disabled={isDisabled}
                  className="h-5 w-5"
                />
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => {
                    if (isDynamic) {
                      setViewingGoal({ ...goal, isDynamic: true });
                    } else {
                      setViewingGoal({ ...goal, isCompleted: completed });
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (isDynamic) {
                        setViewingGoal({ ...goal, isDynamic: true });
                      } else {
                        setViewingGoal({ ...goal, isCompleted: completed });
                      }
                    }
                  }}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-base font-medium ${completed ? 'line-through text-muted-foreground' : ''}`}>
                      {goal.title}
                    </span>
                    {isDynamic && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 text-primary border-primary/30">
                        Dynamic
                      </Badge>
                    )}
                  </div>
                  {goal.description && (
                    <p className={`${hasArabic(goal.description || '') ? 'text-base' : 'text-sm'} text-muted-foreground font-normal line-clamp-2 mt-1 ${completed ? 'line-through' : ''}`}>
                      {goal.description}
                    </p>
                  )}
                </div>
                {completed && <Check className="h-4 w-4 text-primary shrink-0" />}
              </div>
            );

            if (isDynamic) return row;

            return (
              <ContextMenu key={`ctx-${displayId}`}>
                <ContextMenuTrigger asChild>{row}</ContextMenuTrigger>
                <ContextMenuContent className="bg-popover">
                  <ContextMenuItem
                    onClick={() => onDeleteGoal?.(realId)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>
      )}
      <ConfettiPortal />

      <GoalDetailSheet
        goal={viewingGoal}
        open={!!viewingGoal}
        onOpenChange={(open) => { if (!open) setViewingGoal(null); }}
      />
    </div>
  );
};

export default TodaysGoals;
