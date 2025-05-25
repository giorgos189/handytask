// src/components/SortableTaskCard.tsx
"use client";

import type { Task } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import { GripVertical } from 'lucide-react';

interface SortableTaskCardProps {
  task: Task;
}

export function SortableTaskCard({ task }: SortableTaskCardProps) {
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
    <div ref={setNodeRef} style={style} className="relative" {...attributes} {...listeners}>
      <TaskCard task={task} />
      <button 
        {...attributes} 
        {...listeners} 
        className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground cursor-grab focus:outline-none focus:ring-2 focus:ring-primary rounded"
        aria-label="Drag task"
      >
        <GripVertical size={20} />
      </button>
    </div>
  );
}
