import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Archery, Plus, MoreHoriz } from 'iconoir-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
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
import GoalFormSheet from '@/components/goals/GoalFormSheet';
import GoalList from '@/components/goals/GoalList';
import type { Goal, GoalInput, GoalWithStatus } from '@/types/goals';

const DYNAMIC_PREFIX = 'dynamic:';

const Goals: React.FC = () => {
  const {
    goals, isLoading, createGoal, updateGoal, deleteGoal, reorderGoals, isCreating, isUpdating,
  } = useGoals();
  const { isCompleted, toggleCompletion, isToggling } = useGoalCompletions();
  const { overdueGoals, completeOverdue, isCompletingOverdue } = useOverdueGoals();
  const isMobile = useIsMobile();
  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [educationPopupOpen, setEducationPopupOpen] = useState(false);

  // Education popup after 3rd goal
  useEffect(() => {
    if (isLoading || goals.length !== 3) return;
    if (localStorage.getItem('dynamic-goals-education-shown')) return;

    const timer = setTimeout(() => {
      setEducationPopupOpen(true);
      localStorage.setItem('dynamic-goals-education-shown', 'true');
    }, 2000);

    return () => clearTimeout(timer);
  }, [goals.length, isLoading]);

  // Dynamic goals
  const { dynamicGoals, isEnabled: dynamicEnabled } = useDynamicGoals();
  const { isCompleted: isDynamicCompleted, toggleCompletion: toggleDynamic, isToggling: isDynamicToggling } = useAdminGoalCompletions();
  const { dynamicGoalsEnabled, goalSortOrder, setDynamicGoalsEnabled, setGoalSortOrder } = useUserPreferences();

  // Build user goals with status
  const userGoalsWithStatus: GoalWithStatus[] = useMemo(
    () => goals.filter(g => g.is_active).map((g) => ({ ...g, isCompleted: isCompleted(g.id) })),
    [goals, isCompleted]
  );

  // Build dynamic goals as GoalWithStatus
  const dynamicGoalsWithStatus: GoalWithStatus[] = useMemo(
    () => dynamicGoals.map((g) => ({
      ...g,
      user_id: '',
      recurrence_type: g.recurrence_type as GoalWithStatus['recurrence_type'],
      recurrence_days: g.recurrence_days ?? null,
      recurrence_pattern: g.recurrence_pattern as any,
      is_active: true,
      id: `${DYNAMIC_PREFIX}${g.id}`,
      isCompleted: isDynamicCompleted(g.id),
      isDynamic: true,
    })),
    [dynamicGoals, isDynamicCompleted]
  );

  // Merge and sort using persisted order
  const mergedGoals: GoalWithStatus[] = useMemo(() => {
    const allGoals = [...userGoalsWithStatus, ...dynamicGoalsWithStatus];
    if (goalSortOrder.length === 0) return allGoals;

    const orderMap = new Map(goalSortOrder.map((id, i) => [id, i]));
    const sorted: GoalWithStatus[] = [];
    const unsorted: GoalWithStatus[] = [];

    for (const g of allGoals) {
      if (orderMap.has(g.id)) sorted.push(g);
      else unsorted.push(g);
    }

    sorted.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
    return [...sorted, ...unsorted];
  }, [userGoalsWithStatus, dynamicGoalsWithStatus, goalSortOrder]);

  const handleAdd = () => { setEditingGoal(null); setFormOpen(true); };
  const handleEdit = (goal: GoalWithStatus) => { if (!goal.isDynamic) { setEditingGoal(goal); setFormOpen(true); } };
  const handleSubmit = async (data: GoalInput) => {
    if (editingGoal) { await updateGoal(editingGoal.id, data); } else { await createGoal(data); }
  };
  const handleDelete = async (id: string) => { await deleteGoal(id); };

  const handleToggle = useCallback((goalId: string) => {
    if (goalId.startsWith(DYNAMIC_PREFIX)) {
      const realId = goalId.slice(DYNAMIC_PREFIX.length);
      toggleDynamic(realId);
    } else {
      const isOverdue = overdueGoals.some((o) => o.goal.id === goalId);
      if (isOverdue) { completeOverdue(goalId); } else { toggleCompletion(goalId); }
    }
  }, [overdueGoals, completeOverdue, toggleCompletion, toggleDynamic]);

  const handleReorder = useCallback((orderedIds: string[]) => {
    // Persist full combined order
    setGoalSortOrder(orderedIds);

    // Update sort_order for user goals only
    const userIds = orderedIds.filter(id => !id.startsWith(DYNAMIC_PREFIX));
    if (userIds.length > 0) {
      reorderGoals(userIds);
    }
  }, [setGoalSortOrder, reorderGoals]);

  const overdueLabels = useMemo(() => {
    const map = new Map<string, string>();
    for (const o of overdueGoals) { map.set(o.goal.id, o.overdueDateLabel); }
    return map;
  }, [overdueGoals]);

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
            {!isMobile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreHoriz className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover p-4 min-w-[280px]">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Receive Dynamic Goals</p>
                      <p className="text-xs text-muted-foreground mt-1">Community goals for all Mumineen, like 'Pray Moti Us Sawalat' on days requiring rozu.</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enabled</span>
                      <Switch
                        checked={dynamicGoalsEnabled}
                        onCheckedChange={(checked) => setDynamicGoalsEnabled(checked)}
                      />
                    </div>
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
        ) : mergedGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <p className="text-sm italic text-muted-foreground max-w-xs mx-auto">
              "He who is mindful of the journey's distance prepares for it."
            </p>
            <Button onClick={handleAdd}>
              <Archery className="mr-2 h-4 w-4" />
              Create your first goal
            </Button>
          </div>
        ) : (
          <GoalList
            goals={mergedGoals}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReorder={handleReorder}
            isToggling={isToggling || isCompletingOverdue || isDynamicToggling}
            overdueLabels={overdueLabels}
          />
        )}
      </div>

      <GoalFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        goal={editingGoal}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />

      <Dialog open={educationPopupOpen} onOpenChange={setEducationPopupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Did you know?</DialogTitle>
            <DialogDescription className="pt-2">
              You're building great habits! Ibadat also offers <strong>Dynamic Goals</strong> — community goals for all Mumineen that appear alongside yours, like "Pray Moti Us Sawalat" on important days. You can enable them anytime from the menu (⋯) at the top of this page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setEducationPopupOpen(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Goals;
