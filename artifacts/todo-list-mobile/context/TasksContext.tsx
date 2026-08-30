import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type Filter = 'active' | 'completed';

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  movedToCompleted: boolean;
  createdAt: number;
};

type TasksContextValue = {
  tasks: Task[];
  note: string;
  filter: Filter;
  isLoading: boolean;
  loadError: string | null;
  setFilter: (filter: Filter) => void;
  setNote: (note: string) => void;
  addTask: (title: string) => Promise<boolean>;
  addBlankTasks: (count: number) => void;
  updateTaskTitle: (id: string, title: string) => void;
  toggleTask: (id: string) => void;
  moveCompletedTasks: () => void;
  deleteTask: (id: string) => void;
  clearCompleted: () => void;
  retryLoad: () => void;
};

const TASKS_KEY = 'little-list-tasks';
const FILTER_KEY = 'little-list-filter';
const NOTE_KEY = 'little-list-note';

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;
  const task = value as Partial<Task>;
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.completed === 'boolean' &&
    (typeof task.movedToCompleted === 'boolean' ||
      typeof task.movedToCompleted === 'undefined') &&
    typeof task.createdAt === 'number'
  );
}

function parseTasks(value: string | null): Task[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed
          .filter(isTask)
          .map((task) => ({
            ...task,
            movedToCompleted: task.movedToCompleted ?? false,
          }))
      : [];
  } catch {
    return [];
  }
}

function createTaskId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function TasksProvider({ children }: PropsWithChildren) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [note, setNote] = useState('');
  const [filter, setFilterState] = useState<Filter>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [savedTasks, savedFilter, savedNote] = await Promise.all([
        AsyncStorage.getItem(TASKS_KEY),
        AsyncStorage.getItem(FILTER_KEY),
        AsyncStorage.getItem(NOTE_KEY),
      ]);
      setTasks(parseTasks(savedTasks));
      setNote(savedNote ?? '');
      setFilterState(
        savedFilter === 'completed' ? 'completed' : 'active',
      );
      setHasLoaded(true);
    } catch {
      setLoadError('Your list could not be loaded from this device.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!hasLoaded) return;
    void AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [hasLoaded, tasks]);

  useEffect(() => {
    if (!hasLoaded) return;
    void AsyncStorage.setItem(FILTER_KEY, filter);
  }, [filter, hasLoaded]);

  useEffect(() => {
    if (!hasLoaded) return;
    void AsyncStorage.setItem(NOTE_KEY, note);
  }, [hasLoaded, note]);

  const setFilter = useCallback((nextFilter: Filter) => {
    setFilterState(nextFilter);
    void Haptics.selectionAsync();
  }, []);

  const addTask = useCallback(async (title: string) => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return false;
    setTasks((current) => [
      {
        id: createTaskId(),
        title: cleanTitle,
        completed: false,
        movedToCompleted: false,
        createdAt: Date.now(),
      },
      ...current,
    ]);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return true;
  }, []);

  const addBlankTasks = useCallback((count: number) => {
    const numberToAdd = Math.max(0, Math.floor(count));
    if (!numberToAdd) return;

    setTasks((current) => [
      ...current,
      ...Array.from({ length: numberToAdd }, () => ({
        id: createTaskId(),
        title: '',
        completed: false,
        movedToCompleted: false,
        createdAt: Date.now(),
      })),
    ]);
  }, []);

  const updateTaskTitle = useCallback((id: string, title: string) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, title } : task)),
    );
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              movedToCompleted: task.completed
                ? false
                : task.movedToCompleted,
            }
          : task,
      ),
    );
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const moveCompletedTasks = useCallback(() => {
    setTasks((current) =>
      current.map((task) =>
        task.completed && !task.movedToCompleted
          ? { ...task, movedToCompleted: true }
          : task,
      ),
    );
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((current) => current.filter((task) => !task.completed));
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const value = useMemo(
    () => ({
      tasks,
      note,
      filter,
      isLoading,
      loadError,
      setFilter,
      setNote,
      addTask,
      addBlankTasks,
      updateTaskTitle,
      toggleTask,
      moveCompletedTasks,
      deleteTask,
      clearCompleted,
      retryLoad: load,
    }),
    [
      addTask,
      addBlankTasks,
      clearCompleted,
      deleteTask,
      filter,
      isLoading,
      load,
      loadError,
      moveCompletedTasks,
      note,
      setFilter,
      setNote,
      tasks,
      toggleTask,
      updateTaskTitle,
    ],
  );

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used inside TasksProvider');
  }
  return context;
}