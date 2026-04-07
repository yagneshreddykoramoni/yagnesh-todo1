import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { Trash2, Pencil, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskItemProps {
  task: Task;
  completed: boolean;
  onToggle: () => void;
  disableToggle?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  isDraggable: boolean;
}

export function TaskItem({ task, completed, onToggle, disableToggle = false, onEdit, onDelete, isDraggable }: TaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !isDraggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-3 rounded-xl border bg-card px-3 py-3.5 transition-all',
        isDragging && 'z-50 shadow-lg',
        completed && 'opacity-50'
      )}
    >
      {isDraggable && (
        <button {...attributes} {...listeners} className="cursor-grab rounded-md p-1 touch-none text-muted-foreground">
          <GripVertical className="h-4.5 w-4.5" />
        </button>
      )}

      <button
        onClick={onToggle}
        disabled={disableToggle}
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 transition-all',
          disableToggle && 'cursor-not-allowed opacity-60',
          completed
            ? 'border-primary bg-primary'
            : 'border-muted-foreground/30'
        )}
      >
        {completed && (
          <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <span className={cn('flex-1 text-sm font-medium', completed && 'line-through text-muted-foreground')}>
        {task.title}
      </span>

      <div className="flex gap-1">
        <button onClick={onEdit} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary">
          <Pencil className="h-4 w-4" />
        </button>
        <button onClick={onDelete} className="rounded-lg p-2 text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
