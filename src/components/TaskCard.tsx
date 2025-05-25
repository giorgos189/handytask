// src/components/TaskCard.tsx
import type { Task } from '@/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TaskStatusBadge } from './TaskStatusBadge';
import { User, MapPin, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getCurrentUser, User as AuthUser } from '@/auth/auth';
import { Mail } from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const timeAgo = formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true });
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const canEdit = currentUser?.role === 'admin' || (currentUser?.role === 'employee' && currentUser.email === task.assignedHandyman);

  const editButton = (
    <Button asChild variant="link" size="sm" className="text-primary hover:underline" disabled={!canEdit}>
      <Link href={`/task/${task.id}`}>View Details</Link>
    </Button>
  );

  return (
    <Card className="mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg mb-1 break-words">
            Task #{task.id.split('-')[1]}
          </CardTitle>
          <TaskStatusBadge status={task.status} />
        </div>
        <CardDescription className="flex items-center text-sm">
          <User className="h-4 w-4 mr-2 shrink-0" /> {task.clientName}
        </CardDescription>
        <CardDescription className="flex items-center text-sm">
          <MapPin className="h-4 w-4 mr-2 shrink-0" /> {task.address}
        </CardDescription>
      </CardHeader>
 <CardContent className="space-y-2">
        {task.assignedHandyman && (
           <p className="text-sm text-muted-foreground flex items-center">
            <Mail className="h-4 w-4 mr-2 shrink-0" /> Assigned to: {task.assignedHandyman}
          </p>
        )}
        <p className="text-sm text-muted-foreground line-clamp-3 flex items-start">
          <FileText className="h-4 w-4 mr-2 mt-1 shrink-0" />
          <span className="flex-1">{task.problemDescription}</span>
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">Updated {timeAgo}</p>
        {editButton}
      </CardFooter>
    </Card>
  );
}
