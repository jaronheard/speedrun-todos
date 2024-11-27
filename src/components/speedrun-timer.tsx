"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { type TaskData, type CompletedTaskData } from "~/types/task";
import { toast } from "sonner";

interface SpeedrunTimerProps {
  tasks: TaskData[];
}

export default function SpeedrunTimer({ tasks }: SpeedrunTimerProps) {
  const router = useRouter();
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<CompletedTaskData[]>([]);
  const [pausedTime, setPausedTime] = useState(0);
  const [taskStartTime, setTaskStartTime] = useState<number | null>(null);

  const utils = api.useUtils();
  const completeTodoistTask = api.todoist.completeTask.useMutation();
  const completeLinearTask = api.integrations.completeLinearTask.useMutation();

  const tempKey = "55744da8e9d911a8d9506577615f048289aca85d";

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const tenths = Math.floor((ms % 1000) / 100);

    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${tenths}`;
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        if (isRunning) {
          setPausedTime(elapsedTime);
        } else {
          setStartTime(Date.now() - elapsedTime);
        }
        setIsRunning((prev) => !prev);
      } else if (event.code === "Enter" && isRunning) {
        event.preventDefault();
        const task = tasks[currentTaskIndex];
        if (task) {
          const taskDurationMs = Date.now() - (taskStartTime ?? Date.now());
          const newCompletedTasks = [
            ...completedTasks,
            {
              ...task,
              duration: taskDurationMs,
            },
          ];
          setCompletedTasks(newCompletedTasks);

          if (currentTaskIndex === tasks.length - 1) {
            setIsRunning(false);
          } else {
            setTaskStartTime(Date.now());
          }

          setCurrentTaskIndex((prev) => prev + 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    currentTaskIndex,
    isRunning,
    taskStartTime,
    tasks,
    completedTasks,
    elapsedTime,
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      setStartTime((prev) => prev ?? Date.now());
      setTaskStartTime((prev) => prev ?? Date.now());

      interval = setInterval(() => {
        setElapsedTime(Date.now() - (startTime ?? Date.now()));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const getTaskContent = (task: TaskData | CompletedTaskData) => {
    return task.source === "linear" && "identifier" in task
      ? `${task.identifier}: ${task.title}`
      : task.title;
  };

  const handleSave = useCallback(async () => {
    router.push("/");
    const promise = Promise.all(
      completedTasks.map((task) => {
        if (task.source === "linear") {
          return completeLinearTask.mutateAsync({
            id: task.id,
            comment: `⏱️ Completed in ${formatTime(task.duration)}`,
          });
        }
        return completeTodoistTask.mutateAsync({
          key: tempKey,
          id: task.id,
          content: `⏱️${formatTime(task.duration)} - ${task.title}`,
          labels: [
            "speedrun",
            ...(task.labels ?? [])
              .map((label) => (typeof label === "string" ? label : label.name))
              .filter((label): label is string => typeof label === "string"),
          ],
        });
      }),
    ).then(async () => {
      await Promise.all([
        utils.todoist.getTasks.invalidate(),
        utils.integrations.getLinearTasks.invalidate(),
      ]);
    });

    toast.promise(promise, {
      loading: "Completing tasks...",
      success: "All tasks completed successfully!",
      error: "Failed to complete tasks",
    });
  }, [completedTasks, completeTodoistTask, completeLinearTask, router, utils]);

  if (currentTaskIndex >= tasks.length) {
    return (
      <Card className="p-6">
        <h2 className="mb-4 text-2xl font-bold">Summary</h2>
        <div className="space-y-4">
          <p>
            Total time:{" "}
            <span className="font-mono">{formatTime(elapsedTime)}</span>
          </p>
          <ul className="space-y-2">
            {completedTasks.map((task) => (
              <li key={task.id}>
                ✅ {getTaskContent(task)} -{" "}
                <span className="font-mono">{formatTime(task.duration)}</span>
              </li>
            ))}
          </ul>
          <Button onClick={handleSave}>Save & Return</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="text-center font-mono text-2xl font-bold">
          {formatTime(elapsedTime)}
        </div>
        <div className="space-y-2">
          {completedTasks.map((task) => (
            <div key={task.id} className="text-muted-foreground line-through">
              {getTaskContent(task)} -{" "}
              <span className="font-mono">{formatTime(task.duration)}</span>
            </div>
          ))}
          <div className="text-xl font-bold">
            {getTaskContent(tasks[currentTaskIndex]!)}
          </div>
          {tasks.slice(currentTaskIndex + 1).map((task) => (
            <div key={task.id} className="text-muted-foreground">
              {getTaskContent(task)}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
