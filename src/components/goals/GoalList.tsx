import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import GoalCard from './GoalCard';
import type { GoalWithStatus } from '@/types/goals';

interface GoalListProps {
  goals: GoalWithStatus[];
  onToggle: (goalId: string) => void;
  onEdit: (goal: GoalWithStatus) => void;
  onDelete: (goalId: string) => void;
  onViewDynamic?: (goal: GoalWithStatus) => void;
  onReorder: (orderedIds: string[]) => void;
  isToggling?: boolean;
  overdueLabels?: Map<string, string>;
}

const GoalList: React.FC<GoalListProps> = ({
  goals,
  onToggle,
  onEdit,
  onDelete,
  onViewDynamic,
  onReorder,
  isToggling = false,
  overdueLabels,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = goals.findIndex((g) => g.id === active.id);
    const newIndex = goals.findIndex((g) => g.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...goals];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    onReorder(reordered.map((g) => g.id));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={goals.map((g) => g.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDynamic={onViewDynamic}
              isToggling={isToggling}
              overdueLabel={overdueLabels?.get(goal.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default GoalList;
