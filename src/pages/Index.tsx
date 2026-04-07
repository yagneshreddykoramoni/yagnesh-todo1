import { useState } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { TasksPage } from '@/components/TasksPage';
import { NotesPage } from '@/components/NotesPage';
import { ReportsPage } from '@/components/ReportsPage';

type Tab = 'tasks' | 'notes' | 'reports';

const Index = () => {
  const [tab, setTab] = useState<Tab>('tasks');

  return (
    <div className="min-h-screen bg-background">
      {tab === 'tasks' && <TasksPage />}
      {tab === 'notes' && <NotesPage />}
      {tab === 'reports' && <ReportsPage />}
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
};

export default Index;
