import React, { useState } from 'react';
import { Plus, EditPencil, Trash, Check, Xmark } from 'iconoir-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useAdminTags, type Tag, type TagInput } from '@/hooks/useAdminTags';

const AdminTags: React.FC = () => {
  const { tags, isLoading, createTag, updateTag, deleteTag, isCreating, isUpdating } = useAdminTags();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newSlug, setNewSlug] = useState('');

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditLabel(tag.label);
    setEditSlug(tag.slug);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel('');
    setEditSlug('');
  };

  const saveEdit = async () => {
    if (!editingId || !editLabel.trim() || !editSlug.trim()) return;
    await updateTag(editingId, { label: editLabel.trim(), slug: editSlug.trim() });
    cancelEdit();
  };

  const handleCreate = async () => {
    if (!newLabel.trim() || !newSlug.trim()) return;
    await createTag({ label: newLabel.trim(), slug: newSlug.trim() });
    setNewLabel('');
    setNewSlug('');
    setShowNew(false);
  };

  const autoSlug = (label: string) =>
    label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl tracking-tight font-display font-normal">Tags</h1>
            <p className="text-base text-muted-foreground mt-1">
              Manage goal categories visible to all users.
            </p>
          </div>
          <Button onClick={() => setShowNew(true)} disabled={showNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Tag
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-12">Loading...</p>
        ) : (
          <div className="space-y-2">
            {/* New tag row */}
            {showNew && (
              <div className="flex items-center gap-2 rounded-xl border bg-card p-3">
                <Input
                  placeholder="Label"
                  value={newLabel}
                  onChange={(e) => {
                    setNewLabel(e.target.value);
                    if (!newSlug || newSlug === autoSlug(newLabel)) {
                      setNewSlug(autoSlug(e.target.value));
                    }
                  }}
                  className="flex-1"
                />
                <Input
                  placeholder="slug"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCreate}
                  disabled={isCreating || !newLabel.trim() || !newSlug.trim()}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => { setShowNew(false); setNewLabel(''); setNewSlug(''); }}
                >
                  <Xmark className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Existing tags */}
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-2 rounded-xl border bg-card p-3"
              >
                {editingId === tag.id ? (
                  <>
                    <Input
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className="flex-1 font-mono text-sm"
                    />
                    <Button size="icon" variant="ghost" onClick={saveEdit} disabled={isUpdating}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={cancelEdit}>
                      <Cancel className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{tag.label}</p>
                      <p className="text-xs text-muted-foreground font-mono">{tag.slug}</p>
                    </div>
                    <Switch
                      checked={tag.is_active}
                      onCheckedChange={(checked) => updateTag(tag.id, { is_active: checked })}
                    />
                    <Button size="icon" variant="ghost" onClick={() => startEdit(tag)}>
                      <EditPencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => deleteTag(tag.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}

            {tags.length === 0 && !showNew && (
              <p className="text-muted-foreground text-center py-12">No tags yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTags;
