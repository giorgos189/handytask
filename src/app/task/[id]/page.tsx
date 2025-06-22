// src/app/task/[id]/page.tsx
import { notFound } from 'next/navigation';
import type { Task, TaskStatus } from '@/types';
import type { User as AuthUser } from '@/auth/auth'; // Import User type from auth.ts
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskStatusBadge } from '@/components/TaskStatusBadge';
import { AITroubleshooting } from '@/components/AITroubleshooting';
import { ArrowLeft, CalendarDays, User, MapPin, Phone, Users, ClipboardList, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

// Import prisma client
import prisma from '@/lib/prisma';

interface TaskDetailPageProps {
  params: {
    id: string;
  };
}

// This is now an async Server Component
export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const taskId = params.id;

  // Fetch task and user data directly from the database
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  const allUsers = await prisma.user.findMany();

  // If task is not found, return a 404 page
  if (!task) {
    notFound();
  }

  // Note: Status update logic is not implemented here.
  // You will need to implement this separately using Server Actions or API Routes
  // that update the database. The Select component below is for display
  // and initial value based on the fetched task status.

  const getHandymanDetails = (email: string): AuthUser | undefined => {
    // Ensure allUsers is treated as an array even if empty
    return (allUsers || []).find(u => u.email.toLowerCase() === email.toLowerCase());
  };

  const displayAssignedHandymen = () => {
    if (!task.assignedHandymen || task.assignedHandymen.length === 0) {
      return <p className="text-sm text-muted-foreground">Not assigned to any handyman.</p>;
    }
    return (
      <ul className="list-disc pl-5 text-sm space-y-1">
        {task.assignedHandymen.map((email: string) => {
          const handyman = getHandymanDetails(email);
          return (
            <li key={email}>
              {handyman ? `${handyman.name} ${handyman.surname} (${email})` : email}
            </li>
          );
        })}
      </ul>
    );
  };

  // Since this is a Server Component, we don't need a loading state based on client-side fetch
  // The component will only render once data is fetched on the server or notFound is called.

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Back button - still uses router, which is fine in client-side interaction */}
      {/* You might consider if this button should also trigger a server-side navigation */}
      <Button variant="outline" onClick={() => window.history.back()} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <CardTitle className="text-3xl font-bold flex items-center">
              <ClipboardList className="mr-3 h-8 w-8 text-primary" />
              Task #{task.id.substring(0, 8)}...
            </CardTitle>
            {/* Use task.status directly for the initial render */}
            <TaskStatusBadge status={task.status as TaskStatus} />
          </div>
          <CardDescription className="mt-1 text-sm">
            Created: {format(new Date(task.createdAt), "PPP 'at' p")} | Last Updated: {format(new Date(task.updatedAt), "PPP 'at' p")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-6"> {/* Added wrapper div */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Client Details Card */}
              <Card className="p-0 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center"><User className="mr-2 h-5 w-5 text-primary" />Client Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong className="font-medium text-foreground">Name:</strong> {task.clientName}</p>
                  <p className="flex items-start"><MapPin className="inline mr-2 mt-0.5 h-4 w-4 text-muted-foreground shrink-0" /> <span className="flex-1">{task.address}</span></p>
                  <p className="flex items-center"><Phone className="inline mr-2 h-4 w-4 text-muted-foreground shrink-0" /> {task.contactInfo}</p>
                </CardContent>
              </Card>

              {/* Assignment & Status Card */}
              <Card className="p-0 bg-card/50">
                <CardHeader className="pb-3">
                   <CardTitle className="text-xl flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />Assignment & Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3"> {/* Fixed closing bracket */}
                  <div>
                    <Label className="font-medium text-foreground text-sm">Assigned To:</Label>
                    {displayAssignedHandymen()}
                  </div>
                  {/* Status Update Select - This part might need to be a client component
                      if you want interactive status changes handled on the client.
                      For now, it displays the initial status from the server.
                      The onValueChange handler is still there but won\'t update the database.
                      You\'ll need to implement a Server Action or API route for updates.
                  */}
                  <div className="space-y-1 pt-2">
                    <Label htmlFor="task-status" className="font-medium text-foreground text-sm">Update Status:</Label>
                    <Select
                      value={task.status as TaskStatus} // Use task.status for initial value
                      onValueChange={(value) => {
                        // This handler will run on the client, but doesn\'t update the DB yet.
                        // You\'ll implement DB update logic here later.
                        console.log("Status change attempted:", value);
                        // Example: Call a Server Action or API route to update status
                        // updateTaskStatusServerAction(task.id, value as TaskStatus);
                      }}
                    >
                      <SelectTrigger id="task-status" className="w-full sm:w-[220px] bg-background">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="To Do">To Do</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-xl font-semibold mb-2 flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" />Problem Description</h3>
            <p className="text-muted-foreground whitespace-pre-line bg-secondary/20 p-4 rounded-md shadow-inner text-sm leading-relaxed">{task.problemDescription}</p>
          </div>

          <Separator />

          {/* AITroubleshooting might need to be a client component that receives task data */}
          <AITroubleshooting task={task} />

        </CardContent>
      </Card>
    </div>
  );
}
