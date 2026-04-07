import { useMemo } from 'react';
import dayjs from 'dayjs';
import { getTasks, getCompletions } from '@/lib/storage';
import { getTasksForDate } from '@/lib/scheduler';
import { BarChart3 } from 'lucide-react';

export function ReportsPage() {
  const report = useMemo(() => {
    const tasks = getTasks();
    const completions = getCompletions();
    const today = dayjs();

    let totalExpected = 0;
    let totalCompleted = 0;
    const taskStats: Record<string, { title: string; expected: number; completed: number }> = {};

    for (let i = 0; i < 7; i++) {
      const dateStr = today.subtract(i, 'day').format('YYYY-MM-DD');
      const dayTasks = getTasksForDate(tasks, dateStr);
      totalExpected += dayTasks.length;

      dayTasks.forEach((t) => {
        if (!taskStats[t.id]) taskStats[t.id] = { title: t.title, expected: 0, completed: 0 };
        taskStats[t.id].expected++;

        if (completions.some((c) => c.taskId === t.id && c.date === dateStr)) {
          totalCompleted++;
          taskStats[t.id].completed++;
        }
      });
    }

    const consistency = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;

    const mostSkipped = Object.values(taskStats)
      .map((s) => ({ ...s, skipped: s.expected - s.completed }))
      .filter((s) => s.skipped > 0)
      .sort((a, b) => b.skipped - a.skipped)
      .slice(0, 3);

    return { totalExpected, totalCompleted, consistency, mostSkipped };
  }, []);

  return (
    <div className="safe-page-bottom flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-lg px-4 pt-4 pb-3">
          <h1 className="text-xl font-bold text-foreground">Weekly Report</h1>
          <p className="text-xs text-muted-foreground">Last 7 days</p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-lg space-y-4 px-4">
        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">{report.totalCompleted}</p>
            <p className="text-[11px] text-muted-foreground">Completed</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{report.totalExpected - report.totalCompleted}</p>
            <p className="text-[11px] text-muted-foreground">Skipped</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-success">{report.consistency}%</p>
            <p className="text-[11px] text-muted-foreground">Consistency</p>
          </div>
        </div>

        {/* Consistency bar */}
        <div className="rounded-xl border bg-card p-4">
          <p className="mb-2 text-sm font-semibold text-foreground">Daily Consistency</p>
          <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${report.consistency}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {report.totalCompleted} of {report.totalExpected} tasks completed
          </p>
        </div>

        {/* Most skipped */}
        {report.mostSkipped.length > 0 && (
          <div className="rounded-xl border bg-card p-4">
            <p className="mb-3 text-sm font-semibold text-foreground">Most Skipped Tasks</p>
            <div className="space-y-2.5">
              {report.mostSkipped.map((task, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{task.title}</span>
                  <span className="text-xs text-destructive font-medium">
                    Skipped {task.skipped}/{task.expected} days
                  </span>
                </div>
              ))}
            </div>
            {report.mostSkipped.length > 0 && (
              <p className="mt-3 rounded-lg bg-accent p-2.5 text-xs text-accent-foreground">
                💡 Try reducing the frequency of "{report.mostSkipped[0].title}" if it feels overwhelming.
              </p>
            )}
          </div>
        )}

        {report.totalExpected === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-3 rounded-2xl bg-accent p-4">
              <BarChart3 className="h-8 w-8 text-accent-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No data yet</p>
            <p className="text-xs text-muted-foreground/70">Add tasks and start completing them to see reports</p>
          </div>
        )}
      </div>
    </div>
  );
}
