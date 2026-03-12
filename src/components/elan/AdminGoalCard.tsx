import React from 'react';
import { MoreHoriz, EditPencil, Trash } from 'iconoir-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCalendar } from '@/contexts/CalendarContext';
import { getRecurrenceDescription } from '@/lib/recurrence';
import { useTags } from '@/hooks/useTags';
import type { AdminGoal } from '@/types/adminGoals';

interface AdminGoalCardProps {
  goal: AdminGoal;
  onEdit: (goal: AdminGoal) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (goal: AdminGoal) => void;
}

const AdminGoalCard: React.FC<AdminGoalCardProps> = ({
  goal, onEdit, onDelete, onTogglePublish,
}) => {
  const { currentDate } = useCalendar();
  const { tags: dbTags } = useTags();
  const recurrenceLabel = getRecurrenceDescription(goal as any, currentDate?.hijri);
  const tagLabel = goal.tag ? dbTags.find((t) => t.value === goal.tag)?.label : null;

  const formatTime = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-medium">{goal.title}</span>
          <Badge
            variant={goal.is_published ? 'default' : 'secondary'}
            className="text-[10px] px-1.5 py-0 shrink-0"
          >
            {goal.is_published ? 'Published' : 'Draft'}
          </Badge>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
            {recurrenceLabel}
          </Badge>
          {tagLabel && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
              {tagLabel}
            </Badge>
          )}
        </div>
        {goal.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {goal.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">
          Start: {goal.start_date}
          {goal.end_date ? ` · End: ${goal.end_date}` : ''}
          {goal.preferred_time ? ` · ${formatTime(goal.preferred_time)}` : ''}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Switch
          checked={goal.is_published}
          onCheckedChange={() => onTogglePublish(goal)}
          className="scale-90"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
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
      </div>
    </div>
  );
};

export default AdminGoalCard;
