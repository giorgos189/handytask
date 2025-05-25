
import type { Task, TaskStatus } from '@/types';
import { create } from 'zustand';
// No direct import of User from '@/auth/auth' needed here for task store logic

interface TaskState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void; // For reordering
  addTicket: (ticket: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'assignedHandymen'> & { assignedHandymen?: string[] }) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void; // Added for clarity
  getTaskById: (taskId: string) => Task | undefined;
  addTaskComment: (taskId: string, commentText: string) => void; 
}

let nextId = 4; 

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [
    {
      id: 'task-1',
      clientName: 'Alice Wonderland',
      address: '123 Rabbit Hole Lane, Wonderland',
      problemDescription: 'The Mad Hatter\'s clock is stuck at tea time. It chimes constantly and is driving everyone mad. Requires urgent repair. Seems like the mainspring is overwound or a gear is jammed.',
      contactInfo: 'alice@example.com',
      status: 'To Do',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      assignedHandymen: ['employee1@example.com'], 
    },
    {
      id: 'task-2',
      clientName: 'Humpty Dumpty',
      address: 'The Great Wall, Nursery Rhyme Land',
      problemDescription: 'Had a great fall and all the king\'s horses and all the king\'s men couldn\'t put me together again. Need structural assessment and repair of a large crack in the outer shell. Materials might include specialized epoxy and paint.',
      contactInfo: 'humpty@example.com',
      status: 'In Progress',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      assignedHandymen: ['employee2@example.com', 'employee3@example.com'], 
    },
    {
      id: 'task-3',
      clientName: 'Queen of Hearts',
      address: 'The Royal Croquet Ground, Wonderland',
      problemDescription: 'Flamingo croquet mallets are refusing to cooperate. They keep trying to fly away. Need them to be weighted or gently persuaded. Also, the rose bushes need painting red, some white ones appeared overnight. This is a horticultural emergency.',
      contactInfo: 'queen@example.com',
      status: 'Completed',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      assignedHandymen: ['employee1@example.com'], 
    },
  ],
  setTasks: (tasks) => {
    set({ tasks });
  },
  addTicket: (ticket) => {
    const newTask: Task = {
      ...ticket,
      id: `task-${nextId++}`,
      status: 'To Do',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedHandymen: ticket.assignedHandymen || [], 
    };
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
    return newTask;
  },
  updateTask: (taskId, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
      )
    }));
  },
  updateTaskStatus: (taskId, newStatus) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus, updatedAt: new Date().toISOString() } : task
      ),
    }));
  },
  getTaskById: (taskId: string) => {
    return get().tasks.find(task => task.id === taskId);
  },
  addTaskComment: (taskId, commentText) => {
    // This is a mock implementation. In a real app, you'd update the task object.
    console.log(`Comment for task ${taskId}: ${commentText}`);
    // Example:
    // get().updateTask(taskId, { 
    //   comments: [...(get().getTaskById(taskId)?.comments || []), { text: commentText, date: new Date().toISOString(), author: 'System' }] 
    // });
  }
}));

