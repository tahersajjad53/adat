import React, { useState, useMemo } from 'react';
import { Archery, Plus } from 'iconoir-react';
import { Button } from '@/components/ui/button';
import { useGoals } from '@/hooks/useGoals';
import { useGoalCompletions } from '@/hooks/useGoalCompletions';
import { useIsMobile } from '@/hooks/use-mobile';
import GoalFormSheet from '@/components/goals/GoalFormSheet';
import GoalList from '@/components/goals/GoalList';
import type { Goal, GoalInput, GoalWithStatus } from '@/types/goals';

const Goals: React.FC = () => {
  const { goals, isLoading, createGoal, updateGoal, deleteGoal, reorderGoals, isCreating, isUpdating } = useGoals();
  const { isCompleted, toggleCompletion, isToggling } = useGoalCompletions();
  const isMobile = useIsMobile();

  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const goalsWithStatus: GoalWithStatus[] = useMemo(
    () =>
      goals.map((g) => ({
        ...g,
        isCompleted: isCompleted(g.id),
      })),
    [goals, isCompleted]
  );

  const handleAdd = () => {
    setEditingGoal(null);
    setFormOpen(true);
  };

  const handleEdit = (goal: GoalWithStatus) => {
    setEditingGoal(goal);
    setFormOpen(true);
  };

  const handleSubmit = async (data: GoalInput) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, data);
    } else {
      await createGoal(data);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteGoal(id);
  };

  const handleToggle = (goalId: string) => {
    toggleCompletion(goalId);
  };

  const handleReorder = (orderedIds: string[]) => {
    reorderGoals(orderedIds);
  };

  const activeGoals = goalsWithStatus.filter((g) => g.is_active);

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-display">Goals</h1>
            <p className="text-base text-muted-foreground mt-1 font-normal">
              Track your daily spiritual habits and recurring tasks.
            </p>
          </div>
          {!isMobile && (
            <Button onClick={handleAdd}>
              <Archery className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Loading goals...</p>
          </div>
        ) : activeGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Archery className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No goals yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first goal to start tracking your daily habits.
            </p>
          </div>
        ) : (
          <GoalList
            goals={activeGoals}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReorder={handleReorder}
            isToggling={isToggling}
          />
        )}
      </div>

      {/* Mobile FAB */}
      {isMobile && (
        <Button
          onClick={handleAdd}
          size="icon"
          className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      <GoalFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        goal={editingGoal}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
};

export default Goals;
