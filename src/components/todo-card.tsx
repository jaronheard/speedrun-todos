import { type TaskData } from "~/types/task";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

function LinearTaskCard({ task }: { task: LinearTaskData }) {
  return (
    <Card className="h-[100px]">
      <CardContent className="flex h-full items-start justify-between gap-4 p-4">
        <div className="flex-1 overflow-hidden">
          <p className="truncate font-medium">
            {task.identifier}: {task.title}
          </p>
          {task.dueDate && (
            <p className="truncate text-sm text-muted-foreground">
              Due {formatDistanceToNow(new Date(task.dueDate))}
            </p>
          )}
          {task.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {task.description}
            </p>
          )}
        </div>
        {task.state && <Badge variant="secondary">{task.state.name}</Badge>}
      </CardContent>
    </Card>
  );
}

function TodoistTaskCard({ task }: { task: TodoistTaskData }) {
  return (
    <Card className="h-[100px]">
      <CardContent className="flex h-full items-start justify-between gap-4 p-4">
        <div className="flex-1 overflow-hidden">
          <p className="truncate font-medium">{task.title}</p>
          {task.dueDate && (
            <p className="truncate text-sm text-muted-foreground">
              Due {formatDistanceToNow(new Date(task.dueDate))}
            </p>
          )}
          {task.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {task.description}
            </p>
          )}
        </div>
        {task.priority > 1 && (
          <Badge
            className="shrink-0"
            variant={task.priority === 4 ? "destructive" : "secondary"}
          >
            P{task.priority}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

export default function TodoCard({ task }: { task: TaskData }) {
  if (task.source === "linear") {
    return <LinearTaskCard task={task} />;
  }
  return <TodoistTaskCard task={task} />;
}
