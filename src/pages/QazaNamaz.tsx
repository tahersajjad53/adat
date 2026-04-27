import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavArrowLeft, MoreHoriz } from 'iconoir-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMissedPrayers, MissedPrayerItem } from '@/hooks/useMissedPrayers';
import { useQazaMonitoring } from '@/hooks/useQazaMonitoring';
import { formatHijriDate } from '@/lib/hijri';
import { toast } from '@/components/ui/use-toast';

const QazaNamaz: React.FC = () => {
  const navigate = useNavigate();
  const { groups, unfulfilledCount, isLoading, fulfillQaza, clearAll } = useMissedPrayers();
  const { qazaMonitoringEnabled } = useQazaMonitoring();
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [pending, setPending] = useState<Set<string>>(new Set());

  const handleAda = async (item: MissedPrayerItem) => {
    const key = `${item.gregorianDate}|${item.prayer}`;
    setPending(prev => new Set(prev).add(key));
    try {
      await fulfillQaza(item);
    } catch (err) {
      console.error(err);
      toast({ title: 'Could not mark prayer', description: 'Please try again.', variant: 'destructive' });
      setPending(prev => {
        const n = new Set(prev);
        n.delete(key);
        return n;
      });
    }
  };

  const handleClearAll = async () => {
    setConfirmClearOpen(false);
    try {
      await clearAll();
      toast({ title: 'All qaza prayers fulfilled' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Could not clear qaza', variant: 'destructive' });
    }
  };

  return (
    <div className="container py-6 max-w-xl mx-auto space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 -ml-2"
            onClick={() => navigate('/calendar')}
            aria-label="Back"
          >
            <NavArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display tracking-tight font-normal text-xl">Qaza Namaz</h1>
          {unfulfilledCount > 0 && (
            <Badge variant="destructive" className="ml-1">
              {unfulfilledCount > 99 ? '99+' : unfulfilledCount}
            </Badge>
          )}
        </div>
        {unfulfilledCount > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreHoriz className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={() => setConfirmClearOpen(true)}>
                Clear all qaza
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {!qazaMonitoringEnabled && (
        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          Qaza monitoring is disabled. Enable it in Profile to track missed prayers.
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading…</div>
      ) : unfulfilledCount === 0 ? (
        <div className="text-center py-16">
          <p className="text-base text-foreground">No missed prayers</p>
          <p className="text-sm text-muted-foreground mt-1">Alhamdulillah</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(group => {
            const visiblePrayers = group.prayers.filter(
              p => !pending.has(`${p.gregorianDate}|${p.prayer}`)
            );
            if (visiblePrayers.length === 0) return null;
            return (
              <div key={group.gregorianDate} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">{group.dateLabel}</p>
                  {(() => {
                    const toArabicDigits = (n: number) =>
                      String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
                    const h = group.preMaghribHijri;
                    return (
                      <p
                        dir="rtl"
                        lang="ar"
                        className="font-display text-2xl leading-tight text-foreground"
                      >
                        {`${toArabicDigits(h.day)} ${h.monthNameArabic} ${toArabicDigits(h.year)}`}
                      </p>
                    );
                  })()}
                </div>
                <ul className="divide-y divide-border">
                  {visiblePrayers.map(item => {
                    const key = `${item.gregorianDate}|${item.prayer}`;
                    return (
                      <li key={key} className="flex items-center justify-between px-4 py-3">
                        <span className="text-base text-foreground">{item.displayName}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAda(item)}
                        >
                          Ada
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all qaza?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark all {unfulfilledCount} missed prayers as fulfilled. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll}>Clear all</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QazaNamaz;
