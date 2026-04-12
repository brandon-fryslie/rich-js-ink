/**
 * useProgress — state manager for multi-task progress tracking.
 *
 * Manages task state in React, designed to pair with <RichProgress>.
 * Does NOT use rich-js's Progress class (which owns a Live instance
 * and setInterval-based refresh).
 *
 * [LAW:one-source-of-truth] This hook is the single source of task state.
 * [LAW:single-enforcer] React state is the single mutation path.
 */

import { useState, useCallback, useRef } from "react";

export interface TaskState {
  id: number;
  description: string;
  total: number | undefined;
  completed: number;
  started: boolean;
  visible: boolean;
  startTime: number;
}

export interface TaskOptions {
  total?: number;
  start?: boolean;
  visible?: boolean;
}

export interface TaskUpdateOptions {
  completed?: number;
  advance?: number;
  description?: string;
  visible?: boolean;
}

export interface UseProgressResult {
  tasks: TaskState[];
  addTask: (description: string, options?: TaskOptions) => number;
  updateTask: (id: number, options: TaskUpdateOptions) => void;
  startTask: (id: number) => void;
  removeTask: (id: number) => void;
}

export function useProgress(): UseProgressResult {
  const [tasks, setTasks] = useState<TaskState[]>([]);
  const nextIdRef = useRef(1);

  const addTask = useCallback(
    (description: string, options?: TaskOptions): number => {
      const id = nextIdRef.current++;
      const task: TaskState = {
        id,
        description,
        total: options?.total,
        completed: 0,
        started: options?.start !== false,
        visible: options?.visible !== false,
        startTime: Date.now(),
      };
      setTasks((prev) => [...prev, task]);
      return id;
    },
    [],
  );

  const updateTask = useCallback(
    (id: number, options: TaskUpdateOptions): void => {
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== id) return task;
          const updated = { ...task };
          if (options.completed !== undefined) updated.completed = options.completed;
          if (options.advance !== undefined) updated.completed += options.advance;
          if (options.description !== undefined) updated.description = options.description;
          if (options.visible !== undefined) updated.visible = options.visible;
          return updated;
        }),
      );
    },
    [],
  );

  const startTask = useCallback((id: number): void => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, started: true, startTime: Date.now() }
          : task,
      ),
    );
  }, []);

  const removeTask = useCallback((id: number): void => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  return { tasks, addTask, updateTask, startTask, removeTask };
}
