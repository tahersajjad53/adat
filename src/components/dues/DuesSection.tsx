import React, { useState } from 'react';
import { Plus } from 'iconoir-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import SabeelCard from './SabeelCard';
import SabeelFormSheet from './SabeelFormSheet';
import FMBHubForm from './FMBHubForm';
import KhumusForm from './KhumusForm';
import ZakatForm from './ZakatForm';
import { useSabeels } from '@/hooks/useSabeels';
import { useFMBHub } from '@/hooks/useFMBHub';
import { useKhumus } from '@/hooks/useKhumus';
import { useZakat } from '@/hooks/useZakat';
import { Skeleton } from '@/components/ui/skeleton';
import type { Sabeel, SabeelInput, SabeelWithRelations, FMBHub, FMBHubInput, Khumus, KhumusInput, Zakat, ZakatInput } from '@/types/dues';

const DuesSection: React.FC = () => {
  const isMobile = useIsMobile();
  const { sabeels, isLoading, createSabeel, updateSabeel, deleteSabeel, refetch } = useSabeels();
  
  // Sabeel form state
  const [sabeelFormOpen, setSabeelFormOpen] = useState(false);
  const [editingSabeel, setEditingSabeel] = useState<Sabeel | null>(null);
  const [isSabeelSubmitting, setIsSabeelSubmitting] = useState(false);

  // FMB Hub form state
  const [fmbFormOpen, setFmbFormOpen] = useState(false);
  const [fmbSabeelId, setFmbSabeelId] = useState<string>('');
  const [editingFMBHub, setEditingFMBHub] = useState<FMBHub | null>(null);
  const [isFmbSubmitting, setIsFmbSubmitting] = useState(false);

  // Khumus form state
  const [khumusFormOpen, setKhumusFormOpen] = useState(false);
  const [khumusSabeelId, setKhumusSabeelId] = useState<string>('');
  const [editingKhumus, setEditingKhumus] = useState<Khumus | null>(null);
  const [isKhumusSubmitting, setIsKhumusSubmitting] = useState(false);

  // Zakat form state
  const [zakatFormOpen, setZakatFormOpen] = useState(false);
  const [zakatSabeelId, setZakatSabeelId] = useState<string>('');
  const [editingZakat, setEditingZakat] = useState<Zakat | null>(null);
  const [isZakatSubmitting, setIsZakatSubmitting] = useState(false);

  // Hooks for nested entities
  const { createFMBHub, updateFMBHub, deleteFMBHub } = useFMBHub(refetch);
  const { createKhumus, updateKhumus, deleteKhumus } = useKhumus(refetch);
  const { createZakat, updateZakat, deleteZakat } = useZakat(refetch);

  // Sabeel handlers
  const handleAddSabeel = () => {
    setEditingSabeel(null);
    setSabeelFormOpen(true);
  };

  const handleEditSabeel = (sabeel: SabeelWithRelations) => {
    setEditingSabeel(sabeel);
    setSabeelFormOpen(true);
  };

  const handleDeleteSabeel = async (sabeelId: string) => {
    if (confirm('Are you sure you want to delete this Sabeel? All related FMB Hub, Khumus, and Zakat entries will also be deleted.')) {
      await deleteSabeel(sabeelId);
    }
  };

  const handleSabeelSubmit = async (data: SabeelInput) => {
    setIsSabeelSubmitting(true);
    try {
      if (editingSabeel) {
        await updateSabeel(editingSabeel.id, data);
      } else {
        await createSabeel(data);
      }
      setSabeelFormOpen(false);
    } finally {
      setIsSabeelSubmitting(false);
    }
  };

  // FMB Hub handlers
  const handleAddFMBHub = (sabeelId: string) => {
    setFmbSabeelId(sabeelId);
    setEditingFMBHub(null);
    setFmbFormOpen(true);
  };

  const handleEditFMBHub = (fmbHubId: string) => {
    const sabeel = sabeels.find((s) => s.fmb_hub?.id === fmbHubId);
    if (sabeel?.fmb_hub) {
      setFmbSabeelId(sabeel.id);
      setEditingFMBHub(sabeel.fmb_hub);
      setFmbFormOpen(true);
    }
  };

  const handleDeleteFMBHub = async (fmbHubId: string) => {
    if (confirm('Are you sure you want to delete this FMB Hub?')) {
      await deleteFMBHub(fmbHubId);
    }
  };

  const handleFmbSubmit = async (data: FMBHubInput) => {
    setIsFmbSubmitting(true);
    try {
      if (editingFMBHub) {
        await updateFMBHub(editingFMBHub.id, data);
      } else {
        await createFMBHub(data);
      }
      setFmbFormOpen(false);
    } finally {
      setIsFmbSubmitting(false);
    }
  };

  // Khumus handlers
  const handleAddKhumus = (sabeelId: string) => {
    setKhumusSabeelId(sabeelId);
    setEditingKhumus(null);
    setKhumusFormOpen(true);
  };

  const handleEditKhumus = (khumusId: string) => {
    for (const sabeel of sabeels) {
      const khumus = sabeel.khumus_list.find((k) => k.id === khumusId);
      if (khumus) {
        setKhumusSabeelId(sabeel.id);
        setEditingKhumus(khumus);
        setKhumusFormOpen(true);
        break;
      }
    }
  };

  const handleDeleteKhumus = async (khumusId: string) => {
    if (confirm('Are you sure you want to delete this Khumus entry?')) {
      await deleteKhumus(khumusId);
    }
  };

  const handleKhumusSubmit = async (data: KhumusInput) => {
    setIsKhumusSubmitting(true);
    try {
      if (editingKhumus) {
        await updateKhumus(editingKhumus.id, data);
      } else {
        await createKhumus(data);
      }
      setKhumusFormOpen(false);
    } finally {
      setIsKhumusSubmitting(false);
    }
  };

  // Zakat handlers
  const handleAddZakat = (sabeelId: string) => {
    setZakatSabeelId(sabeelId);
    setEditingZakat(null);
    setZakatFormOpen(true);
  };

  const handleEditZakat = (zakatId: string) => {
    for (const sabeel of sabeels) {
      const zakat = sabeel.zakats.find((z) => z.id === zakatId);
      if (zakat) {
        setZakatSabeelId(sabeel.id);
        setEditingZakat(zakat);
        setZakatFormOpen(true);
        break;
      }
    }
  };

  const handleDeleteZakat = async (zakatId: string) => {
    if (confirm('Are you sure you want to delete this Zakat entry?')) {
      await deleteZakat(zakatId);
    }
  };

  const handleZakatSubmit = async (data: ZakatInput) => {
    setIsZakatSubmitting(true);
    try {
      if (editingZakat) {
        await updateZakat(editingZakat.id, data);
      } else {
        await createZakat(data);
      }
      setZakatFormOpen(false);
    } finally {
      setIsZakatSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
        <h2 className="font-display tracking-tight font-normal text-xl">Sabeel</h2>
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
        <h2 className="font-display tracking-tight font-normal text-xl">Sabeel</h2>
        {!isMobile && (
          <Button size="sm" onClick={handleAddSabeel}>
            <Plus className="h-4 w-4 mr-1" />
            Add Sabeel
          </Button>
        )}
      </div>

      {sabeels.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No Sabeels configured yet. Add your first Sabeel to start tracking your dues.
          </p>
          {!isMobile && (
            <Button variant="outline" onClick={handleAddSabeel}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Sabeel
            </Button>
          )}
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

      {/* Sabeel Form */}
      <SabeelFormSheet
        open={sabeelFormOpen}
        onOpenChange={setSabeelFormOpen}
        sabeel={editingSabeel}
        onSubmit={handleSabeelSubmit}
        isLoading={isSabeelSubmitting}
      />

      {/* FMB Hub Form */}
      <FMBHubForm
        open={fmbFormOpen}
        onOpenChange={setFmbFormOpen}
        sabeelId={fmbSabeelId}
        fmbHub={editingFMBHub}
        onSubmit={handleFmbSubmit}
        isLoading={isFmbSubmitting}
      />

      {/* Khumus Form */}
      <KhumusForm
        open={khumusFormOpen}
        onOpenChange={setKhumusFormOpen}
        sabeelId={khumusSabeelId}
        khumus={editingKhumus}
        onSubmit={handleKhumusSubmit}
        isLoading={isKhumusSubmitting}
      />

      {/* Zakat Form */}
      <ZakatForm
        open={zakatFormOpen}
        onOpenChange={setZakatFormOpen}
        sabeelId={zakatSabeelId}
        zakat={editingZakat}
        onSubmit={handleZakatSubmit}
        isLoading={isZakatSubmitting}
      />

      {/* Mobile FAB */}
      {isMobile && (
        <Button
          onClick={handleAddSabeel}
          size="icon"
          className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </section>
  );
};

export default DuesSection;
