// src/components/TaskStatusBadge.tsx
import type { TaskStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  let className = '';

  switch (status) {
    case 'To Do':
      variant = 'outline';
      className = 'border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400'; // Custom style for 'To Do'
      break;
    case 'In Progress':
      variant = 'outline';
      className = 'border-yellow-500 text-yellow-500 dark:border-yellow-400 dark:text-yellow-400'; // Custom style for 'In Progress'
      break;
    case 'Completed':
      variant = 'outline';
      className = 'border-green-500 text-green-500 dark:border-green-400 dark:text-green-400'; // Custom style for 'Completed'
      break;
    default:
      variant = 'secondary';
      break;
  }

  return (
    <Badge variant={variant} className={cn('capitalize', className)}>
      {status}
    </Badge>
  );
}
