import React, { useRef } from 'react';
import { MoreHoriz, EditPencil, Trash } from 'iconoir-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getRecurrenceDescription } from '@/lib/recurrence';
import { useConfetti } from '@/components/ui/confetti';
import type { GoalWithStatus } from '@/types/goals';

interface GoalCardProps {
  goal: GoalWithStatus;
  onToggle: (goalId: string) => void;
  onEdit: (goal: GoalWithStatus) => void;
  onDelete: (goalId: string) => void;
  isToggling?: boolean;
  overdueLabel?: string;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onToggle,
  onEdit,
  onDelete,
  isToggling = false,
  overdueLabel,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const recurrenceLabel = getRecurrenceDescription(goal);
  const checkboxRef = useRef<HTMLButtonElement>(null);
  const { triggerConfetti, ConfettiPortal } = useConfetti();

  const handleToggle = () => {
    if (!goal.isCompleted) {
      triggerConfetti(checkboxRef.current);
    }
    onToggle(goal.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-start gap-4 rounded-xl border ${
        overdueLabel ? 'border-destructive/30' : 'border-border'
      } bg-card p-4 transition-colors ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      } ${goal.isCompleted ? 'opacity-75' : ''}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 cursor-grab touch-none text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="3" r="1.5" />
          <circle cx="11" cy="3" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="13" r="1.5" />
          <circle cx="11" cy="13" r="1.5" />
        </svg>
      </button>

      {/* Checkbox */}
      <Checkbox
        ref={checkboxRef}
        checked={goal.isCompleted}
        onCheckedChange={handleToggle}
        disabled={isToggling}
        className="mt-0.5"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-base font-medium leading-tight ${
              goal.isCompleted ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {goal.title}
          </span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
            {recurrenceLabel}
          </Badge>
        </div>
        {goal.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {goal.description}
          </p>
        )}
        {overdueLabel && (
          <p className="text-xs font-medium text-destructive mt-0.5">
            {overdueLabel}
          </p>
        )}
      </div>

      {/* Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <MoreHoriz className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover">
          <DropdownMenuItem onClick={() => onEdit(goal)}>
            <EditPencil className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(goal.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfettiPortal />
    </div>
  );
};

export default GoalCard;
