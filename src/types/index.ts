
export type TaskStatus = 'To Do' | 'In Progress' | 'Completed';

export interface Task {
  id: string;
  clientName: string;
  address: string;
  problemDescription: string;
  contactInfo: string;
  status: TaskStatus;
  assignedHandymen?: string[]; // Changed from assignedHandyman: string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
