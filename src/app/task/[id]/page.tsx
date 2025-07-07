
// src/app/task/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Task, TaskStatus } from '@/types';
import { useTaskStore } from '@/store/tasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskStatusBadge } from '@/components/TaskStatusBadge';
import { AITroubleshooting } from '@/components/AITroubleshooting';
import { ArrowLeft, CalendarDays, User, MapPin, Phone, Users, ClipboardList, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { getAllUsers, User as AuthUser } from '@/auth/auth';
import { useAuth } from '@/context/AuthContext';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const taskId = typeof params.id === 'string' ? params.id : '';
  
  const { getTaskById, updateTaskStatus } = useTaskStore();

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | undefined>(undefined);
  const [allUsers, setAllUsers] = useState<AuthUser[]>([]);

  useEffect(() => {
    const fetchTaskAndUsers = async () => {
      if (!user) return; // Wait for user to be available from context
      setIsLoading(true);
      
      try {
        const usersPromise = getAllUsers();
        const taskPromise = taskId ? getTaskById(taskId) : Promise.resolve(undefined);

        const [users, foundTask] = await Promise.all([usersPromise, taskPromise]);
        
        setAllUsers(users);

        if (foundTask) {
          setTask(foundTask);
          setSelectedStatus(foundTask.status);
        } else if(taskId) {
          toast({
            title: "Error",
            description: "Task not found. Redirecting to dashboard.",
            variant: "destructive",
          });
          router.push('/');
        }
      } catch (error) {
         console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Could not load task details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskAndUsers();
  }, [taskId, getTaskById, router, toast, user]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (task && newStatus) {
      setSelectedStatus(newStatus);
      await updateTaskStatus(task.id, newStatus);
      setTask(prev => prev ? {...prev, status: newStatus, updatedAt: new Date().toISOString()} : null);
      toast({
        title: "Status Updated",
        description: `Task #${task.id.substring(0,8)}... status changed to ${newStatus}.`,
      });
    }
  };

  const getHandymanDetails = (email: string): AuthUser | undefined => {
    return allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  };

  const displayAssignedHandymen = () => {
    if (!task || !task.assignedHandymen || task.assignedHandymen.length === 0) {
      return <p className="text-sm text-muted-foreground">Not assigned to any handyman.</p>;
    }
    return (
      <ul className="list-disc pl-5 text-sm space-y-1">
        {task.assignedHandymen.map(email => {
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
  
  if (isLoading || !task) {
    return (
      <div className="container mx-auto py-8 text-center flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-xl text-muted-foreground">Loading task details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <CardTitle className="text-3xl font-bold flex items-center">
              <ClipboardList className="mr-3 h-8 w-8 text-primary" />
              Task #{task.id.substring(0,8)}...
            </CardTitle>
            <TaskStatusBadge status={task.status} />
          </div>
          <CardDescription className="mt-1 text-sm">
            Created: {format(new Date(task.createdAt), "PPP 'at' p")} | Last Updated: {format(new Date(task.updatedAt), "PPP 'at' p")}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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

            <Card className="p-0 bg-card/50">
              <CardHeader className="pb-3">
                 <CardTitle className="text-xl flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />Assignment & Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="font-medium text-foreground text-sm">Assigned To:</Label>
                  {displayAssignedHandymen()}
                </div>
                <div className="space-y-1 pt-2">
                  <Label htmlFor="task-status" className="font-medium text-foreground text-sm">Update Status:</Label>
                  <Select value={selectedStatus} onValueChange={(value) => handleStatusChange(value as TaskStatus)}>
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
          
          <Separator />

          <div>
            <h3 className="text-xl font-semibold mb-2 flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" />Problem Description</h3>
            <p className="text-muted-foreground whitespace-pre-line bg-secondary/20 p-4 rounded-md shadow-inner text-sm leading-relaxed">{task.problemDescription}</p>
          </div>

          <Separator />
          
          <AITroubleshooting task={task} />
          
        </CardContent>
      </Card>
    </div>
  );
}
