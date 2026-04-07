import dayjs from 'dayjs';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateNavProps {
  selectedDate: string;
  onSelect: (date: string) => void;
}

export function DateNav({ selectedDate, onSelect }: DateNavProps) {
  const today = dayjs().format('YYYY-MM-DD');
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
  const minDate = dayjs().subtract(2, 'day').format('YYYY-MM-DD');

  const canGoBack = selectedDate > minDate;
  const canGoForward = selectedDate < tomorrow;

  const navigate = (dir: -1 | 1) => {
    const next = dayjs(selectedDate).add(dir, 'day').format('YYYY-MM-DD');
    if (next >= minDate && next <= tomorrow) onSelect(next);
  };

  const formatLabel = (d: string) => {
    if (d === today) return 'Today';
    if (d === tomorrow) return 'Tomorrow';
    if (d === dayjs().subtract(1, 'day').format('YYYY-MM-DD')) return 'Yesterday';
    return dayjs(d).format('ddd, MMM D');
  };

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <button
        onClick={() => navigate(-1)}
        disabled={!canGoBack}
        className="rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-30"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <span className="text-sm font-semibold text-foreground">{formatLabel(selectedDate)}</span>
      <button
        onClick={() => navigate(1)}
        disabled={!canGoForward}
        className="rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-30"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
