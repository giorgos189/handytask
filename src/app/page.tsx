// src/app/page.tsx - Task Dashboard
"use client";

import { useEffect, useState } from 'react';
import type { Task, TaskStatus } from '@/types';
import { useTaskStore } from '@/store/tasks';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTaskCard } from '@/components/SortableTaskCard';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getCurrentUser, type UserRole } from '@/auth/auth'; // Import getCurrentUser and UserRole

const statusColumns: TaskStatus[] = ['To Do', 'In Progress', 'Completed'];

export default function TaskDashboardPage() {
  const tasksFromStore = useTaskStore((state) => state.tasks);
  const updateTaskStatusInStore = useTaskStore((state) => state.updateTaskStatus);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | undefined>(undefined);

  useEffect(() => {
    setTasks(tasksFromStore);
    const user = getCurrentUser();
    if (user) {
      setCurrentUserRole(user.role);
    }
  }, [tasksFromStore]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newTasksArray = arrayMove(tasks, oldIndex, newIndex);
        setTasks(newTasksArray);

        // Update status based on column if over.data.current.columnId exists
        const overColumnId = over?.data?.current?.sortable?.containerId as TaskStatus;
        if (overColumnId && statusColumns.includes(overColumnId)) {
           const activeTask = tasks.find(task => task.id === active.id);
           if (activeTask && activeTask.status !== overColumnId) {
             updateTaskStatusInStore(active.id as string, overColumnId);
           }
        }
      }
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Task Dashboard</h1>
        {currentUserRole === 'admin' && ( // Conditionally render the button
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
                items={tasks.filter(task => task.status === status).map(t => t.id)} 
                strategy={verticalListSortingStrategy}
                id={status}
              >
                <div className="space-y-4 min-h-[200px]">
                  {tasks
                    .filter((task) => task.status === status)
                    .map((task) => (
                       <SortableTaskCard key={task.id} task={task} />
                    ))}
                  {tasks.filter((task) => task.status === status).length === 0 && (
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
