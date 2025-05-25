
// src/components/TaskCard.tsx
import type { Task } from '@/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TaskStatusBadge } from './TaskStatusBadge';
import { User, MapPin, FileText, Users, Edit3, ExternalLink } from 'lucide-react'; // Changed Mail to Users
import { format, formatDistanceToNow } from 'date-fns';
import { getCurrentUser, User as AuthUser } from '@/auth/auth';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const [timeAgo, setTimeAgo] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setTimeAgo(formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true }));
    setCurrentUser(getCurrentUser());
  }, [task.updatedAt]); 

  const canViewDetails = !!currentUser;

  const viewDetailsButton = (
    <Button asChild variant="default" size="sm" className="bg-primary hover:bg-primary/90" disabled={!canViewDetails}>
      <Link href={`/task/${task.id}`}>
        View Details
        <ExternalLink className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );

  const displayAssignedHandymen = (emails?: string[]) => {
    if (!emails || emails.length === 0) {
      return 'Not assigned';
    }
    if (emails.length === 1) {
      return emails[0].split('@')[0]; // Show only name part for single assignee
    }
    return `${emails.length} handymen assigned`; // Or a comma-separated list if preferred
  };

  return (
    <Card className="mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-xl font-semibold mb-1 break-words leading-tight">
            Task #{task.id.substring(0, 8)}...
          </CardTitle>
          <TaskStatusBadge status={task.status} />
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          {timeAgo ? `Updated ${timeAgo}` : `Updated on ${format(new Date(task.updatedAt), 'PP')}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pb-4 flex-grow">
        <div className="flex items-center text-sm">
          <User className="h-4 w-4 mr-2 shrink-0 text-primary" />
          <span className="font-medium">{task.clientName}</span>
        </div>
        <div className="flex items-start text-sm">
          <MapPin className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary" />
          <span className="text-muted-foreground">{task.address}</span>
        </div>
         {(task.assignedHandymen && task.assignedHandymen.length > 0) && (
           <div className="flex items-center text-sm">
            <Users className="h-4 w-4 mr-2 shrink-0 text-primary" />
            <span className="text-muted-foreground">Assigned: {displayAssignedHandymen(task.assignedHandymen)}</span>
          </div>
        )}
        <div className="flex items-start text-sm pt-1">
          <FileText className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary" />
          <p className="text-muted-foreground line-clamp-3">{task.problemDescription}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-4">
        {viewDetailsButton}
      </CardFooter>
    </Card>
  );
}
