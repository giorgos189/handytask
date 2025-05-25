
// src/app/task/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Task, TaskStatus } from '@/types';
import { useTaskStore } from '@/store/tasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskStatusBadge } from '@/components/TaskStatusBadge';
import { AITroubleshooting } from '@/components/AITroubleshooting';
import { ArrowLeft, CalendarDays, User, MapPin, Phone, UserCheck, ClipboardList, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const taskId = typeof params.id === 'string' ? params.id : '';
  
  const getTaskById = useTaskStore((state) => state.getTaskById);
  const updateTaskStatusInStore = useTaskStore((state) => state.updateTaskStatus);
  // const addTaskCommentToStore = useTaskStore((state) => state.addTaskComment); // Placeholder

  const [task, setTask] = useState<Task | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | undefined>(undefined);
  // const [newComment, setNewComment] = useState(''); // Placeholder

  useEffect(() => {
    if (taskId) {
      const foundTask = getTaskById(taskId);
      if (foundTask) {
        setTask(foundTask);
        setSelectedStatus(foundTask.status);
      } else {
        toast({
          title: "Error",
          description: "Task not found. Redirecting to dashboard.",
          variant: "destructive",
        });
        router.push('/');
      }
    }
  }, [taskId, getTaskById, router, toast]);

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (task && newStatus) {
      setSelectedStatus(newStatus);
      updateTaskStatusInStore(task.id, newStatus);
      setTask(prev => prev ? {...prev, status: newStatus, updatedAt: new Date().toISOString()} : null);
      toast({
        title: "Status Updated",
        description: `Task #${task.id.substring(0,8)}... status changed to ${newStatus}.`,
      });
    }
  };

  // const handleAddComment = () => { // Placeholder
  //   if (task && newComment.trim()) {
  //     addTaskCommentToStore(task.id, newComment.trim());
  //     setNewComment('');
  //     toast({ title: "Comment Added", description: "Your comment has been added."});
  //   }
  // };

  if (!task) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-xl text-muted-foreground">Loading task details...</p>
        {/* Could add a spinner here */}
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
            {/* Client Details Section */}
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

            {/* Assignment & Status Section */}
            <Card className="p-0 bg-card/50">
              <CardHeader className="pb-3">
                 <CardTitle className="text-xl flex items-center"><UserCheck className="mr-2 h-5 w-5 text-primary" />Assignment & Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p><strong className="font-medium text-foreground">Assigned To:</strong> {task.assignedHandyman ? task.assignedHandyman.split('@')[0] : 'Not assigned'}</p>
                <div className="space-y-1">
                  <Label htmlFor="task-status" className="font-medium text-foreground">Update Status:</Label>
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

          {/* Problem Description Section */}
          <div>
            <h3 className="text-xl font-semibold mb-2 flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" />Problem Description</h3>
            <p className="text-muted-foreground whitespace-pre-line bg-secondary/20 p-4 rounded-md shadow-inner text-sm leading-relaxed">{task.problemDescription}</p>
          </div>

          <Separator />
          
          {/* AI Troubleshooting Section */}
          <AITroubleshooting task={task} />

          {/* Placeholder for Communication / Comments Section */}
          {/* 
          <Separator />
          <Card className="mt-6 bg-card/50">
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary" />Comments / Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground p-4 border rounded-md bg-background">No comments yet.</div>
              <Textarea
                placeholder="Add a comment or note..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px] bg-background"
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>Add Comment</Button>
            </CardContent>
          </Card>
          */}
        </CardContent>
      </Card>
    </div>
  );
}
