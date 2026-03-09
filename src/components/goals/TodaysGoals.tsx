import React, { useRef, useState, useMemo } from 'react';
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
import type { TagOption } from '@/hooks/useTags';
import { hasArabic } from '@/lib/textUtils';

const DYNAMIC_PREFIX = 'dynamic:';
const UNTAGGED_KEY = '__untagged__';

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
  dynamicGoals?: AdminGoal[];
  isDynamicCompleted?: (goalId: string) => boolean;
  onDynamicToggle?: (goalId: string) => void;
  isDynamicToggling?: boolean;
  sortedGoals?: GoalWithStatus[];
  tags?: TagOption[];
  tagSortOrder?: string[];
  onEditGoal?: (goal: Goal) => void;
}

// Helper type for grouped items
type GroupItem =
  | { type: 'goal'; data: GoalWithStatus }
  | { type: 'overdue'; data: OverdueGoal };

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
  tags = [],
  tagSortOrder = [],
  onEditGoal,
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

  const dynamicCompletedCount = dynamicGoals.filter((g) => isDynamicCompleted?.(g.id)).length;
  const totalDisplay = goalsTotal + overdueGoals.length + dynamicGoals.length;
  const completedDisplay = goalsCompleted + dynamicCompletedCount;

  // Build tag label map
  const tagLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    tags.forEach((t) => map.set(t.value, t.label));
    map.set(UNTAGGED_KEY, 'Other');
    return map;
  }, [tags]);

  // Group goals + overdue by tag
  const groupedByTag = useMemo(() => {
    const map = new Map<string, GroupItem[]>();

    // Add today's goals
    const allGoals = sortedGoals ?? goalsDueToday.map((g) => ({ ...g, isCompleted: isCompleted(g.id) }));
    for (const goal of allGoals) {
      const tagKey = (goal as Goal).tag || UNTAGGED_KEY;
      if (!map.has(tagKey)) map.set(tagKey, []);
      map.get(tagKey)!.push({ type: 'goal', data: goal });
    }

    // Add overdue goals
    for (const overdue of overdueGoals) {
      const tagKey = overdue.goal.tag || UNTAGGED_KEY;
      if (!map.has(tagKey)) map.set(tagKey, []);
      // Insert overdue at the beginning of the group
      map.get(tagKey)!.unshift({ type: 'overdue', data: overdue });
    }

    return map;
  }, [sortedGoals, goalsDueToday, isCompleted, overdueGoals]);

  // Determine ordered tag keys
  const orderedTagKeys = useMemo(() => {
    const allKeys = new Set(groupedByTag.keys());
    const ordered: string[] = [];

    // First, add tags in user's preferred order
    for (const key of tagSortOrder) {
      if (allKeys.has(key)) {
        ordered.push(key);
        allKeys.delete(key);
      }
    }

    // Then add remaining tags in admin sort order (tags prop order)
    for (const t of tags) {
      if (allKeys.has(t.value)) {
        ordered.push(t.value);
        allKeys.delete(t.value);
      }
    }

    // Finally, untagged at the end if not already placed
    if (allKeys.has(UNTAGGED_KEY)) {
      ordered.push(UNTAGGED_KEY);
      allKeys.delete(UNTAGGED_KEY);
    }

    // Any remaining
    for (const key of allKeys) {
      ordered.push(key);
    }

    return ordered;
  }, [groupedByTag, tagSortOrder, tags]);

  const hasMultipleTags = orderedTagKeys.length > 1;

  const renderGoalRow = (goal: GoalWithStatus) => {
    const isDynamic = !!goal.isDynamic;
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
          onClick={() => setViewingGoal(isDynamic ? { ...goal, isDynamic: true } : { ...goal, isCompleted: completed })}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setViewingGoal(isDynamic ? { ...goal, isDynamic: true } : { ...goal, isCompleted: completed });
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
  };

  const renderOverdueRow = (overdue: OverdueGoal) => {
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
          onClick={() => setViewingGoal({ ...overdue.goal, isCompleted: false })}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setViewingGoal({ ...overdue.goal, isCompleted: false });
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
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Archery className="h-5 w-5 text-primary" />
          <h2 className="font-display tracking-tight font-normal text-xl">Today's Goals</h2>
        </div>
        {overdueGoals.length > 0 && (
          <span className="text-xs font-medium text-destructive">
            {overdueGoals.length} overdue
          </span>
        )}
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
        <div className="space-y-6">
          {orderedTagKeys.map((tagKey) => {
            const items = groupedByTag.get(tagKey);
            if (!items || items.length === 0) return null;

            return (
              <div key={tagKey} className="space-y-3">
                {hasMultipleTags && (
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                    {tagLabelMap.get(tagKey) || tagKey}
                  </h3>
                )}
                {items.map((item) =>
                  item.type === 'overdue'
                    ? renderOverdueRow(item.data)
                    : renderGoalRow(item.data)
                )}
              </div>
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
