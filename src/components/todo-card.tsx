import { type TaskData } from "~/types/task";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

function LinearTaskCard({ task }: { task: LinearTaskData }) {
  const openInLinear = () => {
    const baseUrl = task.originalData.url;
    if (baseUrl) {
      window.open(baseUrl, "_blank");
    }
  };

  return (
    <Card className="h-[100px]">
      <CardContent className="flex h-full items-start justify-between gap-4 p-4">
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-medium">
              {task.identifier}: {task.title}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={openInLinear}
              title="Open in Linear"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            {task.state && <Badge variant="secondary">{task.state.name}</Badge>}
            {task.priority && (
              <Badge variant={task.priority > 2 ? "destructive" : "secondary"}>
                P{task.priority}
              </Badge>
            )}
            {task.estimate && (
              <Badge variant="outline">Size: {task.estimate}</Badge>
            )}
            {task.labels?.map((label) => (
              <Badge
                key={label.name}
                variant="outline"
                style={{
                  backgroundColor: label.color
                    ? `#${label.color}20`
                    : undefined,
                  color: label.color ? `#${label.color}` : undefined,
                }}
              >
                {label.name}
              </Badge>
            ))}
          </div>

          {task.dueDate && (
            <p className="mt-1 truncate text-sm text-muted-foreground">
              Due {formatDistanceToNow(new Date(task.dueDate))}
            </p>
          )}
          {task.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {task.description}
            </p>
          )}
        </div>
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
