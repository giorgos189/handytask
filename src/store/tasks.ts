
import type { Task, TaskStatus } from '@/types';
import { create } from 'zustand';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, getDoc, query, orderBy } from 'firebase/firestore';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  fetchTasks: () => Promise<void>;
  setTasks: (tasks: Task[]) => void;
  addTicket: (ticket: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<Task | null>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  getTaskById: (taskId: string) => Promise<Task | undefined>;
}

const tasksCollection = collection(db, 'tasks');

// Helper to convert Firestore doc to Task object
const docToTask = (doc: any): Task => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt, // Timestamps can be handled as-is if stored properly
        updatedAt: data.updatedAt,
    };
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: true,
  fetchTasks: async () => {
    set({ isLoading: true });
    try {
      const q = query(tasksCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const tasks = querySnapshot.docs.map(docToTask);
      set({ tasks, isLoading: false });
    } catch (error) {
      console.error("Error fetching tasks: ", error);
      set({ isLoading: false });
    }
  },
  setTasks: (tasks) => {
    set({ tasks });
  },
  addTicket: async (ticket) => {
    const newTicketData = {
      ...ticket,
      status: 'To Do' as TaskStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      const docRef = await addDoc(tasksCollection, newTicketData);
      const newTask = { id: docRef.id, ...newTicketData };
      set((state) => ({ tasks: [newTask, ...state.tasks] }));
      return newTask;
    } catch (error) {
      console.error("Error adding ticket: ", error);
      return null;
    }
  },
  updateTask: async (taskId, updates) => {
    const taskRef = doc(db, 'tasks', taskId);
    const updateData = { ...updates, updatedAt: new Date().toISOString() };
    try {
      await updateDoc(taskRef, updateData);
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId ? { ...task, ...updateData } : task
        ),
      }));
    } catch (error) {
      console.error("Error updating task: ", error);
    }
  },
  updateTaskStatus: async (taskId, newStatus) => {
    await get().updateTask(taskId, { status: newStatus });
  },
  getTaskById: async (taskId: string) => {
    // First, try to get from the local store cache
    const localTask = get().tasks.find(task => task.id === taskId);
    if (localTask) return localTask;

    // If not in cache, fetch from Firestore
    try {
        const taskRef = doc(db, 'tasks', taskId);
        const docSnap = await getDoc(taskRef);
        if (docSnap.exists()) {
            return docToTastask(docSnap);
        } else {
            console.log("No such task document!");
            return undefined;
        }
    } catch (error) {
        console.error("Error fetching task by ID: ", error);
        return undefined;
    }
  },
}));

// Helper to convert Firestore doc to Task object, correcting a typo
const docToTastask = (doc: any): Task => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    };
};
