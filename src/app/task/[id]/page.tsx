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
import { ArrowLeft, CalendarDays, User, MapPin, Phone, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const taskId = typeof params.id === 'string' ? params.id : '';
  
  const getTaskById = useTaskStore((state) => state.getTaskById);
  const updateTaskStatusInStore = useTaskStore((state) => state.updateTaskStatus);
  // Placeholder for comment functionality
  // const addTaskCommentToStore = useTaskStore((state) => state.addTaskComment);

  const [task, setTask] = useState<Task | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | undefined>(undefined);
  // const [newComment, setNewComment] = useState('');


  useEffect(() => {
    if (taskId) {
      const foundTask = getTaskById(taskId);
      if (foundTask) {
        setTask(foundTask);
        setSelectedStatus(foundTask.status);
      } else {
        // Handle task not found, e.g., redirect or show error
        router.push('/'); // Redirect to dashboard if task not found
      }
    }
  }, [taskId, getTaskById, router]);

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (task && newStatus) {
      setSelectedStatus(newStatus);
      updateTaskStatusInStore(task.id, newStatus);
      setTask(prev => prev ? {...prev, status: newStatus, updatedAt: new Date().toISOString()} : null);
      toast({
        title: "Status Updated",
        description: `Task #${task.id.split('-')[1]} status changed to ${newStatus}.`,
      });
    }
  };

  // const handleAddComment = () => {
  //   if (task && newComment.trim()) {
  //     addTaskCommentToStore(task.id, newComment.trim());
  //     setNewComment('');
  //     toast({ title: "Comment Added", description: "Your comment has been added to the task."});
  //   }
  // };

  if (!task) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-xl text-muted-foreground">Loading task details or task not found...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <CardTitle className="text-3xl font-bold">Task #{task.id.split('-')[1]}</CardTitle>
            <TaskStatusBadge status={task.status} />
          </div>
          <CardDescription className="mt-1">
            Created: {format(new Date(task.createdAt), "PPP p")} | Last Updated: {format(new Date(task.updatedAt), "PPP p")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center"><User className="mr-2 h-5 w-5 text-primary" />Client Details</h3>
              <p><strong className="text-muted-foreground">Name:</strong> {task.clientName}</p>
              <p><strong className="text-muted-foreground">Address:</strong> <MapPin className="inline mr-1 h-4 w-4 text-muted-foreground" />{task.address}</p>
              <p><strong className="text-muted-foreground">Contact:</strong> <Phone className="inline mr-1 h-4 w-4 text-muted-foreground" />{task.contactInfo}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center"><UserCheck className="mr-2 h-5 w-5 text-primary" />Assignment</h3>
              <p><strong className="text-muted-foreground">Assigned Handyman:</strong> {task.assignedHandyman || 'Not assigned'}</p>
              <div className="space-y-1">
                <Label htmlFor="task-status" className="text-muted-foreground">Update Status:</Label>
                <Select value={selectedStatus} onValueChange={(value) => handleStatusChange(value as TaskStatus)}>
                  <SelectTrigger id="task-status" className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-1 flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" />Problem Description</h3>
            <p className="text-muted-foreground whitespace-pre-line bg-secondary/30 p-4 rounded-md">{task.problemDescription}</p>
          </div>

          <AITroubleshooting task={task} />

          {/* Placeholder for Communication / Comments Section */}
          {/* <Card className="mt-6">
            <CardHeader>
              <CardTitle>Comments / Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 Display existing comments here 
                <div className="text-sm text-muted-foreground p-4 border rounded-md">No comments yet.</div>

                <Textarea
                  placeholder="Add a comment or note..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>Add Comment</Button>
              </div>
            </CardContent>
          </Card> */}

        </CardContent>
      </Card>
    </div>
  );
}

