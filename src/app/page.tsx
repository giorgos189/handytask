
// src/app/page.tsx - Task Dashboard
"use client";

import { useEffect, useState } from 'react';
import type { Task, TaskStatus } from '@/types';
import { useTaskStore } from '@/store/tasks';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTaskCard } from '@/components/SortableTaskCard';
import { PlusCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getCurrentUser, type User as AuthUser } from '@/auth/auth';
import { usePathname } from 'next/navigation';

const statusColumns: TaskStatus[] = ['To Do', 'In Progress', 'Completed'];

export default function TaskDashboardPage() {
  const { tasks, isLoading, fetchTasks, updateTaskStatus, setTasks } = useTaskStore();
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetchTasks();
    const user = getCurrentUser();
    setCurrentUser(user);
  }, [fetchTasks, pathname]);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      setLocalTasks((prevTasks) => {
        const oldIndex = prevTasks.findIndex((task) => task.id === active.id);
        const newIndex = prevTasks.findIndex((task) => task.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return prevTasks;

        let newTasksArray = arrayMove(prevTasks, oldIndex, newIndex);
        
        const activeTask = newTasksArray.find(task => task.id === active.id);
        const overColumnId = over.data?.current?.sortable?.containerId as TaskStatus | undefined;

        if (activeTask && overColumnId && statusColumns.includes(overColumnId) && activeTask.status !== overColumnId) {
          const updatedTask = { ...activeTask, status: overColumnId };
          newTasksArray = newTasksArray.map(task => task.id === active.id ? updatedTask : task);
          updateTaskStatus(active.id as string, overColumnId);
        }
        
        setTasks(newTasksArray);
        return newTasksArray;
      });
    }
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

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statusColumns.map((status) => (
            <div key={status} className="bg-muted/50 p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-foreground capitalize">{status}</h2>
              <SortableContext 
                items={localTasks.filter(task => task.status === status).map(t => t.id)} 
                strategy={verticalListSortingStrategy}
                id={status}
              >
                <div className="space-y-4 min-h-[200px]">
                  {localTasks
                    .filter((task) => task.status === status)
                    .map((task) => (
                       <SortableTaskCard key={task.id} task={task} currentUser={currentUser} />
                    ))}
                  {localTasks.filter((task) => task.status === status).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No tasks in this stage.</p>
                  )}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
}
