"use client";

import {
  type DropResult,
  DragDropContext,
  Droppable,
  Draggable,
  type DroppableProvided,
  type DraggableProvided,
} from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import TodoCard from "./todo-card";
import { type TaskData, mapTodoistTask, mapLinearIssue } from "~/types/task";
import { Loader2 } from "lucide-react";

export default function TodoBoard() {
  const router = useRouter();
  const [selectedTasks, setSelectedTasks] = useState<TaskData[]>([]);
  const [availableTasks, setAvailableTasks] = useState<TaskData[]>([]);

  const { data: account, isLoading: isLoadingAccount } =
    api.todoist.getAccount.useQuery();
  const { data: tasks, isLoading: isLoadingTasks } =
    api.todoist.getTasks.useQuery(
      { key: account?.access_token ?? "" },
      { enabled: !!account?.access_token },
    );
  const { data: linearIssues } = api.integrations.getLinearTasks.useQuery(
    undefined,
    {
      enabled: !!account?.access_token,
    },
  );

  useEffect(() => {
    const todoistTasks = (tasks ?? []).map(mapTodoistTask);
    const linearTasks = (linearIssues ?? []).map(mapLinearIssue);
    setAvailableTasks([...todoistTasks, ...linearTasks]);
  }, [tasks, linearIssues]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Handle reordering within the same list
    if (source.droppableId === destination.droppableId) {
      const items =
        source.droppableId === "tasks"
          ? [...availableTasks]
          : [...selectedTasks];
      const [reorderedItem] = items.splice(source.index, 1);
      if (reorderedItem) {
        items.splice(destination.index, 0, reorderedItem);

        if (source.droppableId === "tasks") {
          setAvailableTasks(items);
        } else {
          setSelectedTasks(items);
        }
      }
      return;
    }

    // Handle moving between lists
    if (destination.droppableId === "selected") {
      const task = availableTasks[source.index];
      if (task) {
        const newAvailableTasks = availableTasks.filter(
          (_, index) => index !== source.index,
        );
        const newSelectedTasks = [...selectedTasks];
        newSelectedTasks.splice(destination.index, 0, task);

        setSelectedTasks(newSelectedTasks);
        setAvailableTasks(newAvailableTasks);
      }
    } else {
      const task = selectedTasks[source.index];
      if (task) {
        const newSelectedTasks = selectedTasks.filter(
          (_, index) => index !== source.index,
        );
        const newAvailableTasks = [...availableTasks];
        newAvailableTasks.splice(destination.index, 0, task);

        setAvailableTasks(newAvailableTasks);
        setSelectedTasks(newSelectedTasks);
      }
    }
  };

  if (isLoadingAccount || isLoadingTasks) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!tasks) {
    return (
      <div className="grid h-[50vh] place-items-center">
        <p className="text-sm text-muted-foreground">No tasks found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <DragDropContext
        onDragEnd={onDragEnd}
        onDragUpdate={(update) => {
          if (update.destination) {
            // You can use these values to update positioning if needed
          }
        }}
      >
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Available Tasks</h2>
          <Droppable droppableId="tasks">
            {(provided: DroppableProvided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="rounded-md border border-dashed p-4"
              >
                {availableTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided: DraggableProvided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={provided.draggableProps.style}
                      >
                        <div className="py-2">
                          <TodoCard task={task} />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Speedrun Queue</h2>
          <Droppable droppableId="selected">
            {(provided: DroppableProvided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="rounded-md border border-dashed p-4"
              >
                {selectedTasks.map((task, index) => (
                  <Draggable
                    key={task.id}
                    draggableId={`selected-${task.id}`}
                    index={index}
                  >
                    {(provided: DraggableProvided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={provided.draggableProps.style}
                      >
                        <div className="py-2">
                          <TodoCard task={task} />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <Button
            className="w-full"
            disabled={selectedTasks.length === 0}
            onClick={() => {
              router.push(`/speedrun?tasks=${JSON.stringify(selectedTasks)}`);
            }}
          >
            Start Speedrun
          </Button>
        </div>
      </DragDropContext>
    </div>
  );
}
