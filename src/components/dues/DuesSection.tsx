import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SabeelCard from './SabeelCard';
import SabeelFormSheet from './SabeelFormSheet';
import { useSabeels } from '@/hooks/useSabeels';
import { Skeleton } from '@/components/ui/skeleton';
import type { Sabeel, SabeelInput, SabeelWithRelations } from '@/types/dues';

const DuesSection: React.FC = () => {
  const { sabeels, isLoading, createSabeel, updateSabeel, deleteSabeel } = useSabeels();
  const [formOpen, setFormOpen] = useState(false);
  const [editingSabeel, setEditingSabeel] = useState<Sabeel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddClick = () => {
    setEditingSabeel(null);
    setFormOpen(true);
  };

  const handleEditSabeel = (sabeel: SabeelWithRelations) => {
    setEditingSabeel(sabeel);
    setFormOpen(true);
  };

  const handleDeleteSabeel = async (sabeelId: string) => {
    if (confirm('Are you sure you want to delete this Sabeel? All related FMB Hub, Khumus, and Zakat entries will also be deleted.')) {
      await deleteSabeel(sabeelId);
    }
  };

  const handleSubmit = async (data: SabeelInput) => {
    setIsSubmitting(true);
    try {
      if (editingSabeel) {
        await updateSabeel(editingSabeel.id, data);
      } else {
        await createSabeel(data);
      }
      setFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Placeholder handlers for child entities (will be implemented in Batch 4)
  const handleAddFMBHub = (sabeelId: string) => {
    console.log('Add FMB Hub for Sabeel:', sabeelId);
    // TODO: Open FMBHubForm
  };

  const handleEditFMBHub = (fmbHubId: string) => {
    console.log('Edit FMB Hub:', fmbHubId);
  };

  const handleDeleteFMBHub = (fmbHubId: string) => {
    console.log('Delete FMB Hub:', fmbHubId);
  };

  const handleAddKhumus = (sabeelId: string) => {
    console.log('Add Khumus for Sabeel:', sabeelId);
  };

  const handleEditKhumus = (khumusId: string) => {
    console.log('Edit Khumus:', khumusId);
  };

  const handleDeleteKhumus = (khumusId: string) => {
    console.log('Delete Khumus:', khumusId);
  };

  const handleAddZakat = (sabeelId: string) => {
    console.log('Add Zakat for Sabeel:', sabeelId);
  };

  const handleEditZakat = (zakatId: string) => {
    console.log('Edit Zakat:', zakatId);
  };

  const handleDeleteZakat = (zakatId: string) => {
    console.log('Delete Zakat:', zakatId);
  };

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Dues & Obligations</h2>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dues & Obligations</h2>
        <Button size="sm" onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-1" />
          Add Sabeel
        </Button>
      </div>

      {sabeels.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No Sabeels configured yet. Add your first Sabeel to start tracking your dues.
          </p>
          <Button variant="outline" onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Sabeel
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sabeels.map((sabeel) => (
            <SabeelCard
              key={sabeel.id}
              sabeel={sabeel}
              onEdit={handleEditSabeel}
              onDelete={handleDeleteSabeel}
              onAddFMBHub={handleAddFMBHub}
              onEditFMBHub={handleEditFMBHub}
              onDeleteFMBHub={handleDeleteFMBHub}
              onAddKhumus={handleAddKhumus}
              onEditKhumus={handleEditKhumus}
              onDeleteKhumus={handleDeleteKhumus}
              onAddZakat={handleAddZakat}
              onEditZakat={handleEditZakat}
              onDeleteZakat={handleDeleteZakat}
            />
          ))}
        </div>
      )}

      <SabeelFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        sabeel={editingSabeel}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </section>
  );
};

export default DuesSection;
