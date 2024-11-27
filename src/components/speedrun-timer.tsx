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
  const [currentTaskTime, setCurrentTaskTime] = useState(0);
  const [lastPauseTime, setLastPauseTime] = useState<number | null>(null);
  const [taskPausedTime, setTaskPausedTime] = useState(0);

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

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        if (isRunning) {
          setLastPauseTime(Date.now());
          setIsRunning(false);
        } else {
          if (lastPauseTime) {
            const pauseDuration = Date.now() - lastPauseTime;
            setPausedTime((prev) => prev + pauseDuration);
            setTaskPausedTime((prev) => prev + pauseDuration);
          }
          setLastPauseTime(null);
          setIsRunning(true);
        }
      } else if (
        event.code === "Enter" &&
        ((event.metaKey && currentTaskIndex >= tasks.length) ||
          (!event.metaKey && currentTaskIndex < tasks.length))
      ) {
        event.preventDefault();
        if (currentTaskIndex >= tasks.length) {
          void handleSave();
          return;
        }

        const task = tasks[currentTaskIndex];
        if (task) {
          const taskDurationMs =
            Date.now() - (taskStartTime ?? Date.now()) - taskPausedTime;
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
            setTaskPausedTime(0);
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
    lastPauseTime,
    handleSave,
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      setStartTime((prev) => prev ?? Date.now());
      setTaskStartTime((prev) => prev ?? Date.now());

      interval = setInterval(() => {
        setElapsedTime(Date.now() - (startTime ?? Date.now()) - pausedTime);
        setCurrentTaskTime(
          Date.now() - (taskStartTime ?? Date.now()) - taskPausedTime,
        );
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime, taskStartTime, pausedTime, taskPausedTime]);

  const getTaskContent = (task: TaskData | CompletedTaskData) => {
    return (
      <>
        <div>{task.title}</div>
        {task.source === "linear" && "identifier" in task && (
          <Button
            variant="outline"
            size="sm"
            className="ml-2 h-6 px-2 text-xs"
            onClick={() => window.open(task.url, "_blank")}
          >
            {task.identifier}
          </Button>
        )}
      </>
    );
  };

  if (currentTaskIndex >= tasks.length) {
    return (
      <div className="relative min-h-screen">
        <div className="flex min-h-screen items-center justify-center pb-16">
          <Card className="w-[600px] p-6">
            <h2 className="mb-4 text-2xl font-bold">Summary</h2>
            <div className="space-y-4">
              <p>
                Total time:{" "}
                <span className="font-mono">{formatTime(elapsedTime)}</span>
              </p>
              <ul className="space-y-2">
                {completedTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex flex-grow-0 items-center gap-2 overflow-hidden">
                      <span className="shrink-0">✅</span>
                      <span className="shrink-0 font-mono">
                        {formatTime(task.duration)}
                      </span>
                      <span className="shrink-0">-</span>
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {task.title}
                      </span>
                    </div>
                    {task.source === "linear" && "identifier" in task && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 shrink-0 px-2 text-xs"
                        onClick={() => window.open(task.url, "_blank")}
                      >
                        {task.identifier}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
              <Button onClick={handleSave}>Save & Return</Button>
            </div>
          </Card>
        </div>

        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-[600px] items-center justify-center gap-2 text-sm text-muted-foreground">
            <kbd className="rounded border px-2 py-1">⌘</kbd>
            <span>+</span>
            <kbd className="rounded border px-2 py-1">Enter</kbd>
            <span>to complete tasks</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="flex min-h-screen items-center justify-center pb-16">
        <Card className="w-[600px] p-6">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Current Task</div>
              <div className="font-mono text-4xl font-bold">
                {formatTime(currentTaskTime)}
              </div>
            </div>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-mono">
                      {formatTime(task.duration)}
                    </span>{" "}
                    - <span className="line-through">{task.title}</span>
                  </div>
                  {task.source === "linear" && "identifier" in task && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2 h-6 px-2 text-xs"
                      onClick={() => window.open(task.url, "_blank")}
                    >
                      {task.identifier}
                    </Button>
                  )}
                </div>
              ))}
              <div className="flex items-center justify-between text-xl font-bold">
                {getTaskContent(tasks[currentTaskIndex]!)}
              </div>
              {tasks.slice(currentTaskIndex + 1).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between text-muted-foreground"
                >
                  {getTaskContent(task)}
                </div>
              ))}
            </div>
            <div className="border-t pt-4 text-center">
              <div className="text-sm text-muted-foreground">Total Time</div>
              <div className="font-mono text-xl font-bold text-muted-foreground">
                {formatTime(elapsedTime)}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[600px] items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <kbd className="rounded border px-2 py-1">Space</kbd>
            <span>to {isRunning ? "pause" : "start"}</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="rounded border px-2 py-1">Enter</kbd>
            <span>to complete task</span>
          </div>
        </div>
      </div>
    </div>
  );
}
