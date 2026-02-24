
// src/app/page.tsx - Task Dashboard
"use client";

import { useEffect } from 'react';
import type { Task, TaskStatus } from '@/types';
import { useTaskStore } from '@/store/tasks';
import { DndContext, closestCorners, type DragEndEvent, DragOverlay, type DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { SortableTaskCard } from '@/components/SortableTaskCard';
import { PlusCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { TaskCard } from '@/components/TaskCard';

const statusColumns: TaskStatus[] = ['To Do', 'In Progress', 'Completed'];

// Droppable column wrapper — registers the whole column area as a drop target
function DroppableColumn({ status, children }: { status: TaskStatus; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] space-y-4 transition-colors rounded-md ${isOver ? 'bg-primary/10 ring-2 ring-primary/30' : ''}`}
    >
      {children}
    </div>
  );
}

export default function TaskDashboardPage() {
  const { tasks, isLoading, fetchTasks, updateTaskStatus, setTasks } = useTaskStore();
  const { user: currentUser } = useAuth();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const dragged = tasks.find((t) => t.id === event.active.id);
    setActiveTask(dragged ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const overId = over.id as string;

    // Determine target column:
    // - If dropped directly on a column droppable → overId IS the status
    // - If dropped on a card → get that card's column from sortable containerId
    let targetStatus: TaskStatus | null = null;
    if (statusColumns.includes(overId as TaskStatus)) {
      targetStatus = overId as TaskStatus;
    } else {
      const containerId = over.data.current?.sortable?.containerId;
      if (containerId && statusColumns.includes(containerId as TaskStatus)) {
        targetStatus = containerId as TaskStatus;
      }
    }

    if (!targetStatus || activeTask.status === targetStatus) return;

    // Optimistic update
    setTasks(tasks.map((t) => (t.id === activeId ? { ...t, status: targetStatus! } : t)));
    // Persist
    updateTaskStatus(activeId, targetStatus);
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading tasks...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Task Dashboard</h1>
        {currentUser?.role === 'admin' && ( 
          <Button asChild>
            <Link href="/submit-ticket">
              <PlusCircle className="mr-2 h-5 w-5" />
              Submit New Ticket
            </Link>
          </Button>
        )}
      </div>

      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statusColumns.map((status) => (
            <div key={status} className="bg-muted/50 p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-foreground capitalize">{status}</h2>
              <SortableContext
                items={tasks.filter((task) => task.status === status).map((t) => t.id)}
                strategy={verticalListSortingStrategy}
                id={status}
              >
                <DroppableColumn status={status}>
                  {tasks
                    .filter((task) => task.status === status)
                    .map((task) => (
                      <SortableTaskCard key={task.id} task={task} currentUser={currentUser} />
                    ))}
                  {tasks.filter((task) => task.status === status).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Drop tasks here
                    </p>
                  )}
                </DroppableColumn>
              </SortableContext>
            </div>
          ))}
        </div>

        {/* Drag overlay — renders a ghost of the card while dragging */}
        <DragOverlay>
          {activeTask ? (
            <div className="opacity-90 shadow-2xl rotate-1">
              <TaskCard task={activeTask} currentUser={currentUser} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
