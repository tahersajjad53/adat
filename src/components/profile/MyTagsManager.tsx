import React, { useState } from 'react';
import { Trash, Plus, Check, Xmark } from 'iconoir-react';
import { useTags } from '@/hooks/useTags';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const MyTagsManager: React.FC = () => {
  const { tags, createPersonalTag, renamePersonalTag, deletePersonalTag, isCreating } = useTags();
  const personal = tags.filter((t) => t.isPersonal);

  const [newLabel, setNewLabel] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label: string } | null>(null);

  const handleCreate = async () => {
    if (!newLabel.trim() || isCreating) return;
    try {
      await createPersonalTag(newLabel);
      setNewLabel('');
    } catch {
      /* toast handled in hook */
    }
  };

  const handleRename = async (id: string) => {
    if (!editLabel.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await renamePersonalTag(id, editLabel);
      setEditingId(null);
    } catch {
      /* toast handled in hook */
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-medium">Your tags</h3>
        <p className="text-sm text-muted-foreground">
          Create your own categories to group goals on the Today page. Up to 30 tags.
        </p>
      </div>

      {/* New tag input */}
      <div className="flex gap-2">
        <Input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleCreate();
            }
          }}
          maxLength={24}
          placeholder="New tag name"
          className="h-10"
        />
        <Button
          type="button"
          onClick={handleCreate}
          disabled={!newLabel.trim() || isCreating}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Personal tag list */}
      {personal.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">You haven't added any personal tags yet.</p>
      ) : (
        <div className="space-y-2">
          {personal.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 rounded-xl border border-border bg-card p-3"
            >
              {editingId === t.id ? (
                <>
                  <Input
                    autoFocus
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (t.id) handleRename(t.id);
                      } else if (e.key === 'Escape') {
                        setEditingId(null);
                      }
                    }}
                    maxLength={24}
                    className="h-9 flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => t.id && handleRename(t.id)}
                    className="p-2 text-muted-foreground hover:text-foreground"
                    aria-label="Save"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="p-2 text-muted-foreground hover:text-foreground"
                    aria-label="Cancel"
                  >
                    <Xmark className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (!t.id) return;
                      setEditingId(t.id);
                      setEditLabel(t.label);
                    }}
                    className="flex-1 text-left text-base font-medium"
                  >
                    {t.label}
                  </button>
                  <button
                    type="button"
                    onClick={() => t.id && setConfirmDelete({ id: t.id, label: t.label })}
                    className="p-2 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${t.label}`}
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{confirmDelete?.label}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Any goals using this tag will become uncategorised. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmDelete) {
                  await deletePersonalTag(confirmDelete.id);
                  setConfirmDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyTagsManager;
