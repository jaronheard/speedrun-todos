"use client";

import {
  type DropResult,
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import TodoCard from "./todo-card";
import { type Task } from "@doist/todoist-api-typescript";

type DroppableProvided = {
  innerRef: (element: HTMLElement | null) => void;
  droppableProps: Record<string, unknown>;
  placeholder?: React.ReactNode;
};

type DraggableProvided = {
  innerRef: (element: HTMLElement | null) => void;
  draggableProps: Record<string, unknown>;
  dragHandleProps: Record<string, unknown> | null;
};

export default function TodoBoard() {
  const router = useRouter();
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);

  const { data: tasks } = api.todoist.getTasks.useQuery({
    key: process.env.NEXT_PUBLIC_TODOIST_KEY!,
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !tasks) return;

    const { source, destination } = result;
    if (source.droppableId === destination.droppableId) return;

    if (destination.droppableId === "selected") {
      const task = tasks[source.index];
      if (task) {
        setSelectedTasks([...selectedTasks, task]);
      }
    } else {
      setSelectedTasks(
        selectedTasks.filter((_, index) => index !== source.index),
      );
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Available Tasks</h2>
          <Droppable droppableId="tasks">
            {(provided: DroppableProvided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {tasks?.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(dragProvided: DraggableProvided) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                      >
                        <TodoCard task={task} />
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
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {selectedTasks.map((task, index) => (
                  <Draggable
                    key={task.id}
                    draggableId={`selected-${task.id}`}
                    index={index}
                  >
                    {(dragProvided: DraggableProvided) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                      >
                        <Card className="p-4">{task.content}</Card>
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
