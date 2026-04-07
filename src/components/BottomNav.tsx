import { CheckSquare, FileText, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'tasks' | 'notes' | 'reports';

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: typeof CheckSquare }[] = [
  { id: 'tasks', label: 'To-Do', icon: CheckSquare },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-nav-bg/95 backdrop-blur safe-bottom">
      <div className="mx-auto flex max-w-lg">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-xs font-medium transition-colors active:scale-[0.99]',
              active === id ? 'text-nav-active' : 'text-nav-inactive'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
