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
    <Card className="min-h-[100px]">
      <CardContent className="flex h-full flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="truncate font-medium leading-tight">
              {task.identifier}: {task.title}
            </p>
          </div>
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

        <div className="flex flex-wrap items-center gap-1.5">
          {task.state && (
            <Badge variant="secondary" className="text-xs">
              {task.state.name}
            </Badge>
          )}
          {/* {task.priority && (
            <Badge
              variant={task.priority > 2 ? "destructive" : "secondary"}
              className="text-xs"
            >
              P{task.priority}
            </Badge>
          )} */}
          {task.estimate && (
            <Badge variant="outline" className="text-xs">
              {task.estimate} pts
            </Badge>
          )}
          {task.labels?.map((label) => (
            <Badge
              key={label.name}
              variant="outline"
              className="text-xs"
              style={{
                backgroundColor: label.color ? `#${label.color}15` : undefined,
                borderColor: label.color ? `#${label.color}30` : undefined,
                color: label.color ? `#${label.color}` : undefined,
              }}
            >
              {label.name}
            </Badge>
          ))}
        </div>

        {task.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {task.description}
          </p>
        )}
        {task.dueDate && (
          <p className="text-xs text-muted-foreground">
            Due {formatDistanceToNow(new Date(task.dueDate))}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function TodoistTaskCard({ task }: { task: TodoistTaskData }) {
  return (
    <Card className="min-h-[100px]">
      <CardContent className="flex h-full flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="flex-1 truncate font-medium leading-tight">
            {task.title}
          </p>
          {task.priority > 1 && (
            <Badge
              className="shrink-0 text-xs"
              variant={task.priority === 4 ? "destructive" : "secondary"}
            >
              P{task.priority}
            </Badge>
          )}
        </div>

        {task.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {task.description}
          </p>
        )}
        {task.dueDate && (
          <p className="text-xs text-muted-foreground">
            Due {formatDistanceToNow(new Date(task.dueDate))}
          </p>
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
