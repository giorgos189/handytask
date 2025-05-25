export type TaskStatus = 'To Do' | 'In Progress' | 'Completed';

export interface Task {
  id: string;
  clientName: string;
  address: string;
  problemDescription: string;
  contactInfo: string;
  status: TaskStatus;
  assignedHandyman?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
