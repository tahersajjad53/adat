import React, { useEffect, useState } from 'react';
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Menu } from 'iconoir-react';
import { useTags, type TagOption } from '@/hooks/useTags';
import { useUserPreferences } from '@/hooks/useUserPreferences';

const UNTAGGED_KEY = '__untagged__';

interface SortableTagItemProps {
  id: string;
  label: string;
}

const SortableTagItem: React.FC<SortableTagItemProps> = ({ id, label }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        aria-label={`Reorder ${label}`}
      >
        <Menu className="h-5 w-5" />
      </button>
      <span className="text-base font-medium">{label}</span>
    </div>
  );
};

const TagOrderPreferences: React.FC = () => {
  const { tags, isLoading: tagsLoading } = useTags();
  const { tagSortOrder, setTagSortOrder } = useUserPreferences();
  const [items, setItems] = useState<{ id: string; label: string }[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Build ordered list from saved order + any new tags
  useEffect(() => {
    if (tagsLoading) return;

    const allTags: { id: string; label: string }[] = tags.map((t) => ({
      id: t.value,
      label: t.label,
    }));
    allTags.push({ id: UNTAGGED_KEY, label: 'Unlisted' });

    if (tagSortOrder.length === 0) {
      setItems(allTags);
      return;
    }

    const tagMap = new Map(allTags.map((t) => [t.id, t]));
    const ordered: { id: string; label: string }[] = [];

    for (const key of tagSortOrder) {
      const tag = tagMap.get(key);
      if (tag) {
        ordered.push(tag);
        tagMap.delete(key);
      }
    }

    // Append any new tags not in saved order
    for (const remaining of tagMap.values()) {
      ordered.push(remaining);
    }

    setItems(ordered);
  }, [tags, tagSortOrder, tagsLoading]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      const newItems = arrayMove(prev, oldIndex, newIndex);
      setTagSortOrder(newItems.map((i) => i.id));
      return newItems;
    });
  };

  if (tagsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Drag to reorder how goal categories appear on your Today page.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item) => (
              <SortableTagItem key={item.id} id={item.id} label={item.label} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default TagOrderPreferences;
