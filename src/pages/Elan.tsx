import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'iconoir-react';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminGoals } from '@/hooks/useAdminGoals';
import AdminGoalForm from '@/components/elan/AdminGoalForm';
import AdminGoalCard from '@/components/elan/AdminGoalCard';
import type { AdminGoal, AdminGoalInput } from '@/types/adminGoals';

const Elan: React.FC = () => {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const {
    goals,
    isLoading,
    createGoal,
    updateGoal,
    deleteGoal,
    isCreating,
    isUpdating,
  } = useAdminGoals();
  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<AdminGoal | null>(null);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/today', { replace: true });
    }
  }, [isAdmin, roleLoading, navigate]);

  if (roleLoading || !isAdmin) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  const handleAdd = () => {
    setEditingGoal(null);
    setFormOpen(true);
  };

  const handleEdit = (goal: AdminGoal) => {
    setEditingGoal(goal);
    setFormOpen(true);
  };

  const handleSubmit = async (data: AdminGoalInput) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, data);
    } else {
      await createGoal(data);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteGoal(id);
  };

  const handleTogglePublish = async (goal: AdminGoal) => {
    await updateGoal(goal.id, { is_published: !goal.is_published });
  };

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="md:text-4xl tracking-tight font-display text-4xl font-normal">
              Elan
            </h1>
            <p className="text-base text-muted-foreground mt-1 font-normal">
              Manage community goals and reminders.
            </p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Goal
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No admin goals yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first community goal.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {goals.map((goal) => (
              <AdminGoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTogglePublish={handleTogglePublish}
              />
            ))}
          </div>
        )}
      </div>

      <AdminGoalForm
        open={formOpen}
        onOpenChange={setFormOpen}
        goal={editingGoal}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
};

export default Elan;
