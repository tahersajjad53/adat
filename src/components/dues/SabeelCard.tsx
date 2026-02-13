import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Moon, Sun, Edit2, Trash2, Plus, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { formatMonthYear } from '@/lib/calendarUtils';
import { calculateKhumusAmount, calculateZakatAmount } from '@/types/dues';
import type { SabeelWithRelations } from '@/types/dues';
import PaymentHistory from './PaymentHistory';

interface SabeelCardProps {
  sabeel: SabeelWithRelations;
  onEdit: (sabeel: SabeelWithRelations) => void;
  onDelete: (sabeelId: string) => void;
  onAddFMBHub: (sabeelId: string) => void;
  onEditFMBHub: (fmbHubId: string) => void;
  onDeleteFMBHub: (fmbHubId: string) => void;
  onAddKhumus: (sabeelId: string) => void;
  onEditKhumus: (khumusId: string) => void;
  onDeleteKhumus: (khumusId: string) => void;
  onAddZakat: (sabeelId: string) => void;
  onEditZakat: (zakatId: string) => void;
  onDeleteZakat: (zakatId: string) => void;
}

const SabeelCard: React.FC<SabeelCardProps> = ({
  sabeel,
  onEdit,
  onDelete,
  onAddFMBHub,
  onEditFMBHub,
  onDeleteFMBHub,
  onAddKhumus,
  onEditKhumus,
  onDeleteKhumus,
  onAddZakat,
  onEditZakat,
  onDeleteZakat,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const hasChildren =
    sabeel.fmb_hub ||
    sabeel.khumus_list.length > 0 ||
    sabeel.zakats.length > 0;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const CalendarIcon = sabeel.calendar_type === 'hijri' ? Moon : Sun;

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <CollapsibleTrigger asChild>
              <button className="flex items-start gap-3 flex-1 text-left min-w-0">
                <div className="mt-0.5">
                  {hasChildren ? (
                    isOpen ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )
                  ) : (
                    <div className="w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground truncate">
                      {sabeel.sabeel_name}
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-xs flex items-center gap-1"
                    >
                      <CalendarIcon className="h-3 w-3" />
                      {sabeel.calendar_type === 'hijri' ? 'Hijri' : 'Gregorian'}
                    </Badge>
                    {!sabeel.is_active && (
                      <Badge variant="secondary" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatAmount(sabeel.monthly_amount)}/month
                    <span className="mx-1.5">·</span>
                    From{' '}
                    {formatMonthYear(
                      sabeel.start_month,
                      sabeel.start_year,
                      sabeel.calendar_type
                    )}
                  </p>
                </div>
              </button>
            </CollapsibleTrigger>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(sabeel)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(sabeel.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Collapsible Content */}
        <CollapsibleContent>
          <div className="border-t border-border bg-muted/30 px-4 py-4 space-y-6">
            {/* FMB Hub Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  FMB Hub
                </h4>
                {!sabeel.fmb_hub && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => onAddFMBHub(sabeel.id)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                )}
              </div>
              {sabeel.fmb_hub ? (
                <div
                  className="flex items-center justify-between bg-card rounded-md p-2.5 border border-border cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onEditFMBHub(sabeel.fmb_hub!.id)}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {formatAmount(sabeel.fmb_hub.monthly_amount)}/month
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onEditFMBHub(sabeel.fmb_hub!.id)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onDeleteFMBHub(sabeel.fmb_hub!.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No FMB Hub configured
                </p>
              )}
            </div>

            {/* Khumus Section */}
            <div className="border-t border-border/50 pt-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Khumus
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => onAddKhumus(sabeel.id)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              {sabeel.khumus_list.length > 0 ? (
                <div className="space-y-2">
                  {sabeel.khumus_list.map((khumus) => (
                    <div
                      key={khumus.id}
                      className="flex items-center justify-between bg-card rounded-md p-2.5 border border-border cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onEditKhumus(khumus.id)}
                    >
                      <div>
                        <p className="text-sm font-medium">{khumus.person_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {khumus.calculation_type === 'fixed'
                            ? formatAmount(khumus.fixed_amount || 0)
                            : `${khumus.percentage_rate}% of ${formatAmount(
                                khumus.monthly_income || 0
                              )} = ${formatAmount(calculateKhumusAmount(khumus))}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onEditKhumus(khumus.id)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => onDeleteKhumus(khumus.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No Khumus entries
                </p>
              )}
            </div>

            {/* Zakat Section */}
            <div className="border-t border-border/50 pt-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Zakat
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => onAddZakat(sabeel.id)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              {sabeel.zakats.length > 0 ? (
                <div className="space-y-2">
                  {sabeel.zakats.map((zakat) => (
                    <div
                      key={zakat.id}
                      className="flex items-center justify-between bg-card rounded-md p-2.5 border border-border cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onEditZakat(zakat.id)}
                    >
                      <div>
                        <p className="text-sm font-medium">{zakat.person_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {zakat.calculation_type === 'fixed'
                            ? formatAmount(zakat.fixed_amount || 0)
                            : `${zakat.zakat_rate}% of ${formatAmount(
                                zakat.assets_value || 0
                              )} = ${formatAmount(calculateZakatAmount(zakat))}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onEditZakat(zakat.id)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => onDeleteZakat(zakat.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No Zakat entries
                </p>
              )}
            </div>

            {/* History Button */}
            <div className="border-t border-border/50 pt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setHistoryOpen(true)}
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <PaymentHistory
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        sabeel={sabeel}
      />
    </div>
  );
};

export default SabeelCard;
