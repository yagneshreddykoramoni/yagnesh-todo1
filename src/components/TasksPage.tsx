import { useState } from 'react';
import { Plus } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useTasks } from '@/hooks/useTasks';
import { DateNav } from '@/components/DateNav';
import { TaskItem } from '@/components/TaskItem';
import { TaskModal } from '@/components/TaskModal';
import { Task } from '@/types';
import dayjs from 'dayjs';

export function TasksPage() {
  const { tasks, selectedDate, setSelectedDate, addTask, updateTask, deleteTask, toggleComplete, isCompleted, reorderTasks } = useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const confirmAndDeleteTask = (task: Task) => {
    if (window.confirm(`Delete task "${task.title}"?`)) {
      deleteTask(task.id);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const activeTasks = tasks.filter((t) => !isCompleted(t.id));
  const completedTasks = tasks.filter((t) => isCompleted(t.id));
  const isFutureSelected = dayjs(selectedDate).isAfter(dayjs(), 'day');

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = activeTasks.findIndex((t) => t.id === active.id);
    const newIndex = activeTasks.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    reorderTasks(arrayMove(activeTasks, oldIndex, newIndex));
  };

  return (
    <div className="safe-page-bottom flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-lg px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold text-foreground">DailyFlow</h1>
        </div>
        <div className="mx-auto max-w-lg">
          <DateNav selectedDate={selectedDate} onSelect={setSelectedDate} />
        </div>
      </header>

      <div className="mx-auto w-full max-w-lg space-y-2 px-4">
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 rounded-2xl bg-accent p-4">
              <Plus className="h-8 w-8 text-accent-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No tasks for this day</p>
            <p className="text-xs text-muted-foreground/70">Tap + to add your first task</p>
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={activeTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {activeTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                completed={false}
                onToggle={() => toggleComplete(task.id)}
                disableToggle={isFutureSelected}
                onEdit={() => { setEditingTask(task); setModalOpen(true); }}
                onDelete={() => confirmAndDeleteTask(task)}
                isDraggable
              />
            ))}
          </SortableContext>
        </DndContext>

        {completedTasks.length > 0 && (
          <>
            <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              Completed ({completedTasks.length})
            </p>
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                completed
                onToggle={() => toggleComplete(task.id)}
                disableToggle={isFutureSelected}
                onEdit={() => { setEditingTask(task); setModalOpen(true); }}
                onDelete={() => confirmAndDeleteTask(task)}
                isDraggable={false}
              />
            ))}
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => { setEditingTask(null); setModalOpen(true); }}
        className="safe-fab-bottom fixed right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-fab text-fab-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>

      <TaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSave={(data) => {
          if (editingTask) {
            updateTask(editingTask.id, data);
          } else {
            addTask(data);
          }
        }}
        editTask={editingTask}
      />
    </div>
  );
}
