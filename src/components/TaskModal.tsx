import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScheduleType, DayOfWeek, Task } from '@/types';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import dayjs from 'dayjs';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'order'>) => void;
  editTask?: Task | null;
}

export function TaskModal({ open, onClose, onSave, editTask }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('everyday');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [interval, setInterval] = useState(2);
  const [oneTimeDate, setOneTimeDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (open) {
      setTitle(editTask?.title ?? '');
      setScheduleType(editTask?.scheduleType ?? 'everyday');
      setSelectedDays(editTask?.selectedDays ?? []);
      setInterval(editTask?.interval ?? 2);
      setOneTimeDate(editTask?.oneTimeDate ? new Date(editTask.oneTimeDate) : undefined);
    }
  }, [open, editTask]);

  const handleSave = () => {
    if (!title.trim()) return;
    const safeInterval = Number.isFinite(interval) ? Math.max(1, Math.floor(interval)) : 1;
    onSave({
      title: title.trim(),
      scheduleType,
      selectedDays: scheduleType === 'specific_days' ? selectedDays : undefined,
      interval: scheduleType === 'every_n_days' ? safeInterval : undefined,
      oneTimeDate: scheduleType === 'one_time' && oneTimeDate
        ? dayjs(oneTimeDate).format('YYYY-MM-DD')
        : undefined,
    });
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setScheduleType('everyday');
    setSelectedDays([]);
    setInterval(2);
    setOneTimeDate(undefined);
  };

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); resetForm(); } }}>
      <DialogContent className="mx-4 max-w-sm rounded-xl">
        <DialogHeader>
          <DialogTitle>{editTask ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to do?"
              className="mt-1"
              autoFocus
            />
          </div>

          <div>
            <Label>Schedule</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {(['everyday', 'specific_days', 'every_n_days', 'one_time'] as ScheduleType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setScheduleType(type)}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                    scheduleType === type
                      ? 'border-primary bg-accent text-accent-foreground'
                      : 'border-border text-muted-foreground hover:bg-secondary'
                  )}
                >
                  {type === 'everyday' && 'Everyday'}
                  {type === 'specific_days' && 'Specific Days'}
                  {type === 'every_n_days' && 'Every N Days'}
                  {type === 'one_time' && 'One Time'}
                </button>
              ))}
            </div>
          </div>

          {scheduleType === 'specific_days' && (
            <div className="flex gap-1.5">
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  onClick={() => toggleDay(i as DayOfWeek)}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-all',
                    selectedDays.includes(i as DayOfWeek)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground'
                  )}
                >
                  {day[0]}
                </button>
              ))}
            </div>
          )}

          {scheduleType === 'every_n_days' && (
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">Every</Label>
              <Input
                type="number"
                min={1}
                step={1}
                value={interval}
                onChange={(e) => {
                  const next = e.target.valueAsNumber;
                  if (!Number.isNaN(next)) setInterval(next);
                }}
                onBlur={() => setInterval((prev) => Math.max(1, Math.floor(prev || 1)))}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          )}

          {scheduleType === 'one_time' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !oneTimeDate && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {oneTimeDate ? format(oneTimeDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={oneTimeDate}
                  onSelect={setOneTimeDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          )}

          <Button onClick={handleSave} className="w-full" disabled={!title.trim()}>
            {editTask ? 'Save Changes' : 'Add Task'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
