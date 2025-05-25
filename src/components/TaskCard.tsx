// src/components/TaskCard.tsx
import type { Task } from '@/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TaskStatusBadge } from './TaskStatusBadge';
import { User, MapPin, FileText, Users, ExternalLink } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import type { User as AuthUser } from '@/auth/auth'; // Renamed to prevent conflict

interface TaskCardProps {
  task: Task;
  currentUser: AuthUser | null; // Accept currentUser as a prop
}

export function TaskCard({ task, currentUser }: TaskCardProps) {
  const [timeAgo, setTimeAgo] = useState<string | null>(null);

  useEffect(() => {
    // This effect handles setting the timeAgo string.
    // It runs on mount and whenever task.updatedAt changes.
    if (task?.updatedAt) {
      setTimeAgo(formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true }));
    }
  }, [task?.updatedAt]); 

  const canViewDetails = !!currentUser; // Determine if details can be viewed based on the prop

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
    // For simplicity, show first handyman's email prefix or count if multiple
    const firstHandymanName = emails[0].split('@')[0];
    if (emails.length === 1) {
      return firstHandymanName; 
    }
    return `${firstHandymanName} + ${emails.length - 1} more`;
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
           {timeAgo ? `Updated ${timeAgo}` : (task?.updatedAt ? `Updated on ${format(new Date(task.updatedAt), 'PP')}`: 'Date N/A')}
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
