// src/components/SortableTaskCard.tsx
"use client";

import type { Task } from '@/types';
import type { User as AuthUser } from '@/auth/auth'; // Import AuthUser
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import { GripVertical } from 'lucide-react';

interface SortableTaskCardProps {
  task: Task;
  currentUser: AuthUser | null; // Add currentUser prop
}

export function SortableTaskCard({ task, currentUser }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    // The main div gets the node ref and dnd-kit attributes
    <div ref={setNodeRef} style={style} {...attributes} className="relative">
      {/* The task card itself is just for display */}
      <TaskCard task={task} currentUser={currentUser} />
      
      {/* The button is the dedicated drag handle, which gets the listeners */}
      <button
        {...listeners}
        className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded cursor-grab"
        aria-label="Drag task"
      >
        <GripVertical size={20} />
      </button>
    </div>
  );
}
