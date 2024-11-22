"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { type Task } from "@doist/todoist-api-typescript";

interface SpeedrunTimerProps {
  tasks: Task[];
}

interface CompletedTask extends Task {
  duration: {
    amount: number;
    unit: "minute";
  };
}

export default function SpeedrunTimer({ tasks }: SpeedrunTimerProps) {
  const router = useRouter();
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);

  const completeTodoistTask = api.todoist.completeTask.useMutation();

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
        setIsRunning((prev) => !prev);
      } else if (event.code === "Enter" && isRunning) {
        event.preventDefault();
        const task = tasks[currentTaskIndex];
        if (task) {
          const durationMs = Date.now() - (startTime ?? Date.now());
          setCompletedTasks([
            ...completedTasks,
            {
              ...task,
              duration: {
                amount: Math.round(durationMs / 60000),
                unit: "minute",
              },
            },
          ]);
          setCurrentTaskIndex((prev) => prev + 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentTaskIndex, isRunning, startTime, tasks, completedTasks]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      setStartTime((prev) => prev ?? Date.now());
      interval = setInterval(() => {
        setElapsedTime(Date.now() - (startTime ?? Date.now()));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const handleSave = useCallback(async () => {
    await Promise.all(
      completedTasks.map((task) =>
        completeTodoistTask.mutateAsync({
          key: process.env.NEXT_PUBLIC_TODOIST_KEY!,
          id: task.id,
          content: `⏱️${formatTime(task.duration.amount * 60000)} - ${task.content}`,
          labels: ["speedrun", ...(task.labels ?? [])],
        }),
      ),
    );
    router.push("/");
  }, [completedTasks, completeTodoistTask, router]);

  if (currentTaskIndex >= tasks.length) {
    return (
      <Card className="p-6">
        <h2 className="mb-4 text-2xl font-bold">Summary</h2>
        <div className="space-y-4">
          <p>Total time: {formatTime(elapsedTime)}</p>
          <ul className="space-y-2">
            {completedTasks.map((task) => (
              <li key={task.id}>
                ✅ {task.content} - {formatTime(task.duration.amount * 60000)}
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
        <div className="text-center text-2xl font-bold">
          {formatTime(elapsedTime)}
        </div>
        <div className="space-y-2">
          {completedTasks.map((task) => (
            <div key={task.id} className="text-muted-foreground line-through">
              {task.content} - {formatTime(task.duration.amount * 60000)}
            </div>
          ))}
          <div className="text-xl font-bold">
            {tasks[currentTaskIndex]?.content}
          </div>
          {tasks.slice(currentTaskIndex + 1).map((task) => (
            <div key={task.id} className="text-muted-foreground">
              {task.content}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
