import { type Task } from "@doist/todoist-api-typescript";
import { type Issue } from "@linear/sdk";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

type TaskItem = Task | Issue;

function isLinearTask(task: TaskItem): task is Issue {
  return "identifier" in task;
}

export default function TodoCard({ task }: { task: TaskItem }) {
  if (isLinearTask(task)) {
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

  // Existing Todoist task rendering
  return (
    <Card className="h-[100px]">
      <CardContent className="flex h-full items-start justify-between gap-4 p-4">
        <div className="flex-1 overflow-hidden">
          <p className="truncate font-medium">{task.content}</p>
          {task.due && (
            <p className="truncate text-sm text-muted-foreground">
              Due {formatDistanceToNow(new Date(task.due.date))}
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
