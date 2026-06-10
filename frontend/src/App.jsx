import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const API_URL = 'http://localhost:4000/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_URL);
      if (!res.ok) {
        throw new Error('Failed to load tasks');
      }
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const todoTasks = tasks.filter((task) => task.status === 'todo');
  const doneTasks = tasks.filter((task) => task.status === 'done');

  const handleCreateTask = async (event) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Task title cannot be empty.');
      return;
    }

    setError('');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed }),
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || 'Failed to create task');
      }
      setTitle('');
      await fetchTasks();
    } catch (err) {
      setError(err.message || 'Failed to create task');
    }
  };

  const handleToggleStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || 'Failed to move task');
      }
      await fetchTasks();
    } catch (err) {
      setError(err.message || 'Failed to move task');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to delete task');
      }
      await fetchTasks();
    } catch (err) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const handleTaskDragStart = (event, taskId) => {
    setDraggedTaskId(taskId);
    event.dataTransfer.setData('text/plain', String(taskId));
    event.dataTransfer.effectAllowed = 'move';
  };

  const resetDragState = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleColumnDragOver = (event, targetStatus) => {
    event.preventDefault();
    setDragOverColumn(targetStatus);
    event.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDragLeave = (event, targetStatus) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      if (dragOverColumn === targetStatus) {
        setDragOverColumn(null);
      }
    }
  };

  const handleColumnDrop = async (event, targetStatus) => {
    event.preventDefault();
    const id = Number.parseInt(event.dataTransfer.getData('text/plain'), 10);

    resetDragState();

    if (Number.isNaN(id)) {
      return;
    }

    const task = tasks.find((item) => item.id === id);
    if (!task || task.status === targetStatus) {
      return;
    }

    await handleToggleStatus(id, targetStatus);
  };

  const renderTaskColumn = (titleText, list) => (
    <section
      className={`space-y-3`}
      aria-label={`${titleText} column`}
      data-testid={titleText === 'To Do' ? 'todo-column' : 'done-column'}
      onDragOver={(event) =>
        handleColumnDragOver(
          event,
          titleText === 'To Do' ? 'todo' : 'done'
        )
      }
      onDragLeave={(event) =>
        handleColumnDragLeave(
          event,
          titleText === 'To Do' ? 'todo' : 'done'
        )
      }
      onDrop={(event) =>
        handleColumnDrop(
          event,
          titleText === 'To Do' ? 'todo' : 'done'
        )
      }
    >
      <Card
        className={`min-h-[240px] border-2 border-dashed transition-colors ${
          dragOverColumn === (titleText === 'To Do' ? 'todo' : 'done')
            ? 'border-black bg-muted/40'
            : 'border-muted'
        }`}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between gap-2">
            <span>{titleText}</span>
            <Badge variant="outline">{list.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks yet</p>
          ) : (
            list.map((task) => (
              <Card
                key={task.id}
                data-testid="task-card"
                data-task-id={task.id}
                draggable
                onDragStart={(event) => handleTaskDragStart(event, task.id)}
                onDragEnd={resetDragState}
                className={`border-border/80 bg-card transition-all hover:shadow-sm ${
                  draggedTaskId === task.id ? 'scale-[0.99] opacity-90' : ''
                }`}
              >
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm leading-relaxed">{task.title}</p>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-[0.12em]">
                      {task.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleToggleStatus(
                          task.id,
                          task.status === 'todo' ? 'done' : 'todo'
                        )
                      }
                    >
                      {task.status === 'todo' ? 'Mark as Done' : 'Move to To Do'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-black text-black hover:bg-black hover:text-white"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  )

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Mini Kanban Task Manager
          </h1>
          <p className="text-sm text-muted-foreground">
            Move tasks between <strong>To Do</strong> and <strong>Done</strong> in a
            clean, focused board.
          </p>
        </header>

        <Card>
          <CardContent className="space-y-4 pt-5">
            <form className="space-y-3" onSubmit={handleCreateTask} data-testid="add-task-form">
              <Label htmlFor="new-task" className="text-sm font-medium">
                New task
              </Label>
              <div className="flex gap-3">
                <Input
                  id="new-task"
                  placeholder="Buy milk"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
                <Button type="submit" data-testid="add-task-button">
                  Add Task
                </Button>
              </div>
            </form>

            {loading && <p className="text-sm text-muted-foreground">Loading tasks…</p>}
            {error && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                Error: {error}
              </p>
            )}
          </CardContent>
        </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {renderTaskColumn('To Do', todoTasks)}
        {renderTaskColumn('Done', doneTasks)}
      </div>
      </div>
    </main>
  )
}

export default App
