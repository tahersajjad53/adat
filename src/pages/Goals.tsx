import React, { useState, useMemo, useRef } from 'react';
import { Archery, Plus, MoreHoriz } from 'iconoir-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGoals } from '@/hooks/useGoals';
import { useGoalCompletions } from '@/hooks/useGoalCompletions';
import { useOverdueGoals } from '@/hooks/useOverdueGoals';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDynamicGoals } from '@/hooks/useDynamicGoals';
import { useAdminGoalCompletions } from '@/hooks/useAdminGoalCompletions';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { getRecurrenceDescription } from '@/lib/recurrence';
import { useConfetti } from '@/components/ui/confetti';
import GoalFormSheet from '@/components/goals/GoalFormSheet';
import GoalList from '@/components/goals/GoalList';
import type { Goal, GoalInput, GoalWithStatus } from '@/types/goals';

const Goals: React.FC = () => {
  const {
    goals, isLoading, createGoal, updateGoal, deleteGoal, reorderGoals, isCreating, isUpdating,
  } = useGoals();
  const { isCompleted, toggleCompletion, isToggling } = useGoalCompletions();
  const { overdueGoals, completeOverdue, isCompletingOverdue } = useOverdueGoals();
  const isMobile = useIsMobile();
  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Dynamic goals
  const { dynamicGoals, isEnabled: dynamicEnabled } = useDynamicGoals();
  const { isCompleted: isDynamicCompleted, toggleCompletion: toggleDynamic, isToggling: isDynamicToggling } = useAdminGoalCompletions();
  const { dynamicGoalsEnabled, setDynamicGoalsEnabled } = useUserPreferences();
  const { triggerConfetti, ConfettiPortal } = useConfetti();
  const dynamicCheckboxRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const goalsWithStatus: GoalWithStatus[] = useMemo(
    () => goals.map((g) => ({ ...g, isCompleted: isCompleted(g.id) })),
    [goals, isCompleted]
  );

  const handleAdd = () => { setEditingGoal(null); setFormOpen(true); };
  const handleEdit = (goal: GoalWithStatus) => { setEditingGoal(goal); setFormOpen(true); };
  const handleSubmit = async (data: GoalInput) => {
    if (editingGoal) { await updateGoal(editingGoal.id, data); } else { await createGoal(data); }
  };
  const handleDelete = async (id: string) => { await deleteGoal(id); };
  const handleToggle = (goalId: string) => {
    const isOverdue = overdueGoals.some((o) => o.goal.id === goalId);
    if (isOverdue) { completeOverdue(goalId); } else { toggleCompletion(goalId); }
  };
  const handleReorder = (orderedIds: string[]) => { reorderGoals(orderedIds); };

  const handleDynamicToggle = (goalId: string) => {
    if (!isDynamicCompleted(goalId)) {
      triggerConfetti(dynamicCheckboxRefs.current.get(goalId));
    }
    toggleDynamic(goalId);
  };

  const overdueLabels = useMemo(() => {
    const map = new Map<string, string>();
    for (const o of overdueGoals) { map.set(o.goal.id, o.overdueDateLabel); }
    return map;
  }, [overdueGoals]);

  const activeGoals = goalsWithStatus.filter((g) => g.is_active);

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="md:text-4xl tracking-tight font-display text-4xl font-normal">Goals</h1>
            <p className="text-base text-muted-foreground mt-1 font-normal">
              Rooted in Niyat, completed with Ikhlas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isMobile && (
              <Button onClick={handleAdd}>
                <Archery className="mr-2 h-4 w-4" />
                Add Goal
              </Button>
            )}
            {/* 3-dot menu for Dynamic Goals toggle */}
            {!isMobile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreHoriz className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover p-3 min-w-[200px]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Dynamic Goals</span>
                    <Switch
                      checked={dynamicGoalsEnabled}
                      onCheckedChange={(checked) => setDynamicGoalsEnabled(checked)}
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Loading goals...</p>
          </div>
        ) : activeGoals.length === 0 && dynamicGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Archery className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No goals yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first goal to start tracking your daily habits.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeGoals.length > 0 && (
              <GoalList
                goals={activeGoals}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReorder={handleReorder}
                isToggling={isToggling || isCompletingOverdue}
                overdueLabels={overdueLabels}
              />
            )}

            {/* Dynamic goals rendered inline after user goals */}
            {dynamicGoals.map((goal) => {
              const completed = isDynamicCompleted(goal.id);
              const recurrenceLabel = getRecurrenceDescription(goal);
              return (
                <div
                  key={`dynamic-${goal.id}`}
                  className={`flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-colors ${
                    completed ? 'opacity-75' : ''
                  }`}
                >
                  <Checkbox
                    ref={(el) => {
                      if (el) dynamicCheckboxRefs.current.set(goal.id, el);
                      else dynamicCheckboxRefs.current.delete(goal.id);
                    }}
                    checked={completed}
                    onCheckedChange={() => handleDynamicToggle(goal.id)}
                    disabled={isDynamicToggling}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-base font-medium leading-tight ${completed ? 'line-through text-muted-foreground' : ''}`}>
                        {goal.title}
                      </span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                        {recurrenceLabel}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 text-primary border-primary/30">
                        Dynamic
                      </Badge>
                    </div>
                    {goal.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{goal.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <GoalFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        goal={editingGoal}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />
      <ConfettiPortal />
    </div>
  );
};

export default Goals;
